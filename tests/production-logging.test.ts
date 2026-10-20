import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadLoggingConfig, resolveLoggingConfig } from '../src/logging/config.ts';
import { createHttpLogSink } from '../src/logging/http.ts';
import { createLogger } from '../src/logging/logger.ts';
import type { LogEntry } from '../src/logging/logger.ts';

test('runtime settings override the build level and allow a same-origin endpoint', () => {
  assert.deepEqual(resolveLoggingConfig({ level: 'info', endpoint: '/api/logs' }, 'warn', false), {
    level: 'info', endpoint: '/api/logs',
  });
  assert.deepEqual(resolveLoggingConfig({ level: 'silent' }, 'debug', true), { level: 'silent' });
  assert.deepEqual(resolveLoggingConfig({ level: 'invalid', endpoint: 'https://elsewhere.test/logs' }, 'error', false), {
    level: 'error',
  });
  for (const endpoint of ['//elsewhere.test/logs', '/\\elsewhere.test/logs', '/api/logs?token=secret', '/']) {
    assert.equal(resolveLoggingConfig({ endpoint }, undefined, false).endpoint, undefined);
  }
});

test('runtime config is fetched uncached and a missing file falls back to build settings', async () => {
  let requested = '';
  let options: RequestInit | undefined;
  const send: typeof fetch = async (url, init) => {
    requested = String(url);
    options = init;
    return Response.json({ level: 'info', endpoint: '/api/logs' });
  };
  assert.deepEqual(await loadLoggingConfig('warn', false, send), {
    level: 'info', endpoint: '/api/logs',
  });
  assert.equal(requested, '/logging-config.json');
  assert.equal(options?.cache, 'no-store');
  assert.deepEqual(await loadLoggingConfig('error', false, async () => new Response(null, { status: 404 })), {
    level: 'error',
  });
  assert.deepEqual(await loadLoggingConfig(undefined, true, async () => { throw new Error('Offline'); }), {
    level: 'debug',
  });
});

test('production entries reach the configured endpoint after level filtering', async () => {
  const requests: { url: string; options?: RequestInit }[] = [];
  const send: typeof fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(null, { status: 204 });
  };
  const output = { debug() {}, info() {}, warn() {}, error() {} };
  const logger = createLogger({ level: 'info', output, sink: createHttpLogSink('/api/logs', send) });
  logger.debug('filtered');
  logger.info('app.initialized');
  logger.error('browser.uncaught_error', { error: new Error('Failure') });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests.map(({ options }) => (JSON.parse(options?.body as string) as LogEntry).message), [
    'app.initialized', 'browser.uncaught_error',
  ]);
  assert.ok(requests.every(({ url, options }) => url === '/api/logs'
    && options?.method === 'POST'
    && options?.mode === 'same-origin'
    && options?.keepalive === true));
});
