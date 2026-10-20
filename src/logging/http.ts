import type { LogEntry } from './logger';

export function createHttpLogSink(
  endpoint: string,
  send: typeof fetch = fetch,
): (entry: LogEntry) => void {
  let warned = false;
  function reportFailure() {
    if (warned) return;
    warned = true;
    console.warn('The configured log endpoint is unavailable. Logs are still shown in the browser console.');
  }

  return (entry) => {
    try {
      void send(endpoint, {
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
