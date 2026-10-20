import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const maxBodyBytes = 64 * 1024;

function isLogEntry(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.timestamp === 'string'
    && Number.isFinite(Date.parse(entry.timestamp))
    && ['debug', 'info', 'warn', 'error'].includes(entry.level as string)
    && typeof entry.message === 'string';
}

export function localFileLogging(): Plugin {
  return {
    name: 'local-file-logging',
    apply: 'serve',
    config: () => ({ server: { watch: { ignored: ['**/logs/**'] } } }),
    async configureServer(server) {
      const logFile = resolve(server.config.root, 'logs/localhost.txt');
      await mkdir(dirname(logFile), { recursive: true });
      await appendFile(logFile, '', 'utf8');
      // Serialize writes so simultaneous browser requests produce complete lines.
      let pendingWrite = Promise.resolve();

      server.middlewares.use((request, response, next) => {
        if (request.url !== '/__local-logs') return next();
        response.setHeader('Cache-Control', 'no-store');

        // Restrict writes to a page served from the same loopback origin.
        let localOrigin = false;
        try {
          const origin = new URL(request.headers.origin ?? '');
          localOrigin = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
            && ['http:', 'https:'].includes(origin.protocol)
            && origin.host === request.headers.host;
        } catch { /* Missing or malformed origins are rejected below. */ }
        if (!localOrigin) {
          response.writeHead(403).end('Local origin required.');
          request.resume();
          return;
        }
        if (request.method !== 'POST') {
          response.setHeader('Allow', 'POST');
          response.writeHead(405).end('POST required.');
          request.resume();
          return;
        }
        if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
          response.writeHead(415).end('JSON required.');
          request.resume();
          return;
        }

        let size = 0;
        const chunks: Buffer[] = [];
        request.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size <= maxBodyBytes) chunks.push(chunk);
          else if (!response.writableEnded) response.writeHead(413).end('Log entry too large.');
        });
        request.on('error', () => {
          if (!response.writableEnded) response.writeHead(400).end('Unable to read log entry.');
        });
        request.on('end', () => {
          if (response.writableEnded) return;
          let entry: unknown;
          try {
            entry = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          } catch {
            response.writeHead(400).end('Invalid JSON.');
            return;
          }
          if (!isLogEntry(entry)) {
            response.writeHead(400).end('Invalid log entry.');
            return;
          }
          const write = pendingWrite.then(() => appendFile(logFile, `${JSON.stringify(entry)}\n`, 'utf8'));
          pendingWrite = write.catch(() => {});
          void write.then(() => {
            response.writeHead(204).end();
          }).catch(() => {
            server.config.logger.error('Unable to write logs/localhost.txt.');
            response.writeHead(500).end('Unable to write log entry.');
          });
        });
      });
    },
  };
}
