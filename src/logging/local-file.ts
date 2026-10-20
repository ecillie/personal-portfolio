import type { LogEntry } from './logger';

/** Only the local Vite development server exposes the file logging endpoint. */
export function createLocalFileSink(
  development: boolean,
  location: Pick<Location, 'hostname' | 'origin'>,
  send: typeof fetch = fetch,
): ((entry: LogEntry) => void) | undefined {
  if (!development || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    return undefined;
  }

  let warned = false;
  function reportFailure() {
    // Use the console directly so a failed transport can't log itself recursively.
    if (!warned) {
      warned = true;
      console.warn('Local file logging is unavailable. Logs are still shown in the browser console.');
    }
  }

  return (entry) => {
    try {
      void send(`${location.origin}/__local-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
        mode: 'same-origin',
      }).then((response) => {
        if (!response.ok) reportFailure();
      }).catch(reportFailure);
    } catch {
      reportFailure();
    }
  };
}
