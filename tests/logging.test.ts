import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installBrowserLogging } from '../src/logging/browser.ts';
import { createLogger, logLevels, resolveLogLevel } from '../src/logging/logger.ts';
import type { LogEntry, LogLevel } from '../src/logging/logger.ts';

function captureLogs(level: LogLevel = 'debug') {
  const entries: LogEntry[] = [];
  const output = {
    debug: (entry: LogEntry) => entries.push(entry),
    info: (entry: LogEntry) => entries.push(entry),
    warn: (entry: LogEntry) => entries.push(entry),
    error: (entry: LogEntry) => entries.push(entry),
  };
  return { logger: createLogger({ level, output }), entries };
}

test('log levels filter messages, including completely silent logging', () => {
  for (const [index, level] of logLevels.entries()) {
    const { logger, entries } = captureLogs(level);
    logger.debug('debug event');
    logger.info('info event');
    logger.warn('warning event');
    logger.error('error event');
    assert.deepEqual(entries.map((entry) => entry.level), logLevels.slice(index, -1));
  }
});

test('configuration accepts known levels and uses safe environment defaults', () => {
  for (const level of logLevels) {
    assert.equal(resolveLogLevel(level, true), level);
    assert.equal(resolveLogLevel(level, false), level);
  }
  for (const invalid of [undefined, null, '', 'verbose', 'ERROR', {}]) {
    assert.equal(resolveLogLevel(invalid, true), 'debug');
    assert.equal(resolveLogLevel(invalid, false), 'warn');
  }
});

test('entries retain structured context and useful Error details', () => {
  const { logger, entries } = captureLogs();
  const error = new TypeError('Unable to render');
  const context = { pathname: '/resume' };
  logger.error('react.uncaught_error', { error, context });
  context.pathname = '/changed';

  const [entry] = entries;
  assert.equal(entry.level, 'error');
  assert.equal(entry.message, 'react.uncaught_error');
  assert.equal(new Date(entry.timestamp).toISOString(), entry.timestamp);
  assert.deepEqual(entry.context, { pathname: '/resume' });
  assert.deepEqual(entry.error, { name: 'TypeError', message: error.message, stack: error.stack });
});

test('non-Error rejections are safe, even with circular or undefined values', () => {
  const { logger, entries } = captureLogs();
  const circular: { self?: unknown } = {};
  circular.self = circular;
  for (const error of ['Request failed', undefined, null, circular]) {
    logger.error('browser.unhandled_rejection', { error });
  }
  assert.equal(entries[0].error?.message, 'Request failed');
  for (const entry of entries.slice(1)) {
    assert.equal(entry.error?.name, 'UnknownError');
    assert.doesNotThrow(() => JSON.stringify(entry));
  }
  logger.info('app.ready');
  assert.equal('error' in entries[4], false);
});

test('browser handlers record failures and clean up without suppressing default behavior', () => {
  const { logger, entries } = captureLogs();
  const events = Object.assign(new EventTarget(), {
    location: { pathname: '/projects', search: '?token=private', hash: '#private' },
  });
  const target = events as unknown as Window;
  const errorEvent = Object.assign(new Event('error', { cancelable: true }), {
    error: new Error('Script failed'), message: 'Script failed', lineno: 12, colno: 7,
  });
  const rejectionEvent = Object.assign(new Event('unhandledrejection', { cancelable: true }), {
    reason: 'Request failed',
  });

  const cleanup = installBrowserLogging(logger, target);
  events.dispatchEvent(errorEvent);
  events.dispatchEvent(rejectionEvent);
  assert.deepEqual(entries.map((entry) => entry.message), [
    'browser.uncaught_error', 'browser.unhandled_rejection',
  ]);
  assert.deepEqual(entries[0].context, { pathname: '/projects', line: 12, column: 7 });
  assert.deepEqual(entries[1].context, { pathname: '/projects' });
  assert.equal(errorEvent.defaultPrevented, false);
  assert.equal(rejectionEvent.defaultPrevented, false);
  assert.equal(JSON.stringify(entries).includes('private'), false);

  cleanup();
  events.dispatchEvent(errorEvent);
  events.dispatchEvent(rejectionEvent);
  assert.equal(entries.length, 2);

  const nextCleanup = installBrowserLogging(logger, target);
  events.dispatchEvent(errorEvent);
  assert.equal(entries.length, 3);
  nextCleanup();
});

test('script errors without an Error object retain the browser message', () => {
  const { logger, entries } = captureLogs();
  const events = Object.assign(new EventTarget(), { location: { pathname: '/' } });
  const cleanup = installBrowserLogging(logger, events as unknown as Window);
  events.dispatchEvent(Object.assign(new Event('error'), {
    error: null, message: 'Script error.', lineno: 0, colno: 0,
  }));
  assert.equal(entries[0].error?.message, 'Script error.');
  cleanup();
});

test('every click emits a separate info entry, including auxiliary clicks', () => {
  const { logger, entries } = captureLogs();
  const events = Object.assign(new EventTarget(), { location: { pathname: '/resume' } });
  const cleanup = installBrowserLogging(logger, events as unknown as Window);
  const click = () => Object.assign(new Event('click', { cancelable: true }), {
    button: 0, detail: 1, clientX: 120, clientY: 80,
  });
  const first = click();
  events.dispatchEvent(first);
  events.dispatchEvent(click());
  events.dispatchEvent(Object.assign(new Event('auxclick'), {
    button: 1, detail: 1, clientX: 10, clientY: 20,
  }));

  assert.equal(entries.length, 3);
  assert.ok(entries.every((entry) => entry.level === 'info' && entry.message === 'browser.click'));
  assert.equal(entries[0].context?.pathname, '/resume');
  assert.equal(entries[0].context?.description, 'Clicked page background on "/resume"');
  assert.equal(entries[0].context?.action, 'click');
  assert.equal(entries[0].context?.x, 120);
  assert.equal(entries[0].context?.y, 80);
  assert.equal(entries[2].context?.mouseButton, 1);
  assert.equal(entries[2].context?.eventType, 'auxclick');
  assert.equal(first.defaultPrevented, false);
  cleanup();
  events.dispatchEvent(click());
  events.dispatchEvent(new Event('auxclick'));
  assert.equal(entries.length, 3);
});
