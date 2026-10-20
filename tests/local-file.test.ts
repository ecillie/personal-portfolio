import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createServer } from 'vite';
import { localFileLogging } from '../dev/local-file-logging.ts';
import { createLocalFileSink } from '../src/logging/local-file.ts';
import { createLogger } from '../src/logging/logger.ts';
import type { LogEntry } from '../src/logging/logger.ts';

const entry: LogEntry = {
  timestamp: new Date().toISOString(), level: 'error', message: 'browser.uncaught_error',
  error: { name: 'Error', message: 'Test failure\nwith a newline' },
};

test('file transport is enabled only for development on loopback hosts', async () => {
  const requests: { url: string; options?: RequestInit }[] = [];
  const send: typeof fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(null, { status: 204 });
  };
  for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
    const location = { hostname, origin: `http://${hostname}:5173` };
    assert.equal(createLocalFileSink(false, location, send), undefined);
    createLocalFileSink(true, location, send)!(entry);
  }
  assert.equal(createLocalFileSink(true, {
    hostname: 'portfolio.example', origin: 'https://portfolio.example',
  }, send), undefined);
  assert.equal(requests.length, 3);
  assert.equal(requests[0].url, 'http://localhost:5173/__local-logs');
  assert.equal(requests[0].options?.method, 'POST');
  assert.equal(requests[0].options?.keepalive, true);
  assert.equal(requests[0].options?.mode, 'same-origin');
  assert.deepEqual(JSON.parse(requests[0].options?.body as string), entry);
});

test('a failed file transport warns once without creating unhandled rejections', async (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  for (const send of [
    async () => { throw new Error('Offline'); },
    async () => new Response(null, { status: 500 }),
    () => { throw new Error('Synchronous failure'); },
  ]) {
    const sink = createLocalFileSink(true, { hostname: 'localhost', origin: 'http://localhost' }, send)!;
    sink(entry);
    sink(entry);
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(warning.mock.callCount(), 3);
});

test('filtered entries never reach the local file transport', () => {
  const entries: LogEntry[] = [];
  const output = { debug() {}, info() {}, warn() {}, error() {} };
  const logger = createLogger({ level: 'warn', output, sink: (entry) => entries.push(entry) });
  logger.info('app.initialized');
  logger.error('test.failure', { error: new Error('Failed') });
  assert.deepEqual(entries.map((entry) => entry.message), ['test.failure']);
});

test('Vite endpoint appends complete entries to a text file and rejects invalid requests', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-logging-'));
  const server = await createServer({
    configFile: false, root, plugins: [localFileLogging()], logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 }, optimizeDeps: { noDiscovery: true },
  });
  t.after(async () => {
    await server.close();
    await rm(root, { recursive: true, force: true });
  });
  await server.listen();
  const address = server.httpServer!.address();
  assert.ok(address && typeof address === 'object');
  const origin = `http://127.0.0.1:${address.port}`;
  const endpoint = `${origin}/__local-logs`;
  const headers = { Origin: origin, 'Content-Type': 'application/json' };
  const logFile = join(root, 'logs/localhost.txt');
  assert.equal(await readFile(logFile, 'utf8'), '');

  const send: typeof fetch = (url, init) => fetch(url, {
    ...init, headers: { ...init?.headers, Origin: origin },
  });
  // Exercise the real browser transport through HTTP and into the file.
  // Await completion explicitly because logger sinks deliberately don't block the UI.
  let completed!: () => void;
  const completion = new Promise<void>((resolve) => { completed = resolve; });
  const awaitedSink = createLocalFileSink(true, { hostname: '127.0.0.1', origin }, async (url, init) => {
    try {
      const response = await send(url, init);
      assert.equal(response.status, 204);
      return response;
    } finally { completed(); }
  })!;
  awaitedSink(entry);
  await completion;
  assert.deepEqual(JSON.parse((await readFile(logFile, 'utf8')).trim()), entry);

  const responses = await Promise.all(Array.from({ length: 5 }, (_, index) => fetch(endpoint, {
    method: 'POST', headers, body: JSON.stringify({ ...entry, message: `concurrent.${index}` }),
  })));
  assert.ok(responses.every((response) => response.status === 204));
  const lines = (await readFile(logFile, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(lines.length, 6);
  assert.equal(new Set(lines.map((line) => line.message)).size, 6);

  for (const [options, status] of [
    [{ method: 'POST', headers: { ...headers, Origin: 'https://example.com' }, body: JSON.stringify(entry) }, 403],
    [{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }, 403],
    [{ method: 'GET', headers }, 405],
    [{ method: 'POST', headers: { ...headers, 'Content-Type': 'text/plain' }, body: '{}' }, 415],
    [{ method: 'POST', headers, body: 'invalid' }, 400],
    [{ method: 'POST', headers, body: JSON.stringify({ message: 'incomplete' }) }, 400],
    [{ method: 'POST', headers, body: JSON.stringify({ ...entry, message: 'x'.repeat(65 * 1024) }) }, 413],
  ] as const) {
    const response = await fetch(endpoint, options);
    assert.equal(response.status, status);
    await response.text();
  }
  assert.equal((await readFile(logFile, 'utf8')).trim().split('\n').length, 6);
});
