export const logLevels = ['debug', 'info', 'warn', 'error', 'silent'] as const;
export type LogLevel = (typeof logLevels)[number];
type MessageLevel = Exclude<LogLevel, 'silent'>;
type LogContext = Readonly<Record<string, string | number | boolean | null | undefined>>;

export interface LogDetails {
  context?: LogContext;
  error?: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: MessageLevel;
  message: string;
  context?: LogContext;
  error?: { name: string; message: string; stack?: string };
}

export type Logger = Record<MessageLevel, (message: string, details?: LogDetails) => void>;
type LogConsole = Pick<Console, MessageLevel>;

export function resolveLogLevel(value: unknown, development: boolean): LogLevel {
  return logLevels.includes(value as LogLevel)
    ? value as LogLevel
    : development ? 'debug' : 'warn';
}

function serializeError(error: unknown): NonNullable<LogEntry['error']> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : 'A non-Error value was thrown or rejected.',
  };
}

export function createLogger({
  level = 'warn',
  output = console,
  sink,
}: { level?: LogLevel; output?: LogConsole; sink?: (entry: LogEntry) => void } = {}): Logger {
  function log(severity: MessageLevel, message: string, details: LogDetails = {}) {
    if (logLevels.indexOf(severity) < logLevels.indexOf(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: severity,
      message,
      ...(details.context ? { context: { ...details.context } } : {}),
      ...('error' in details ? { error: serializeError(details.error) } : {}),
    };
    output[severity](entry);
    sink?.(entry);
  }

  return {
    debug: (message, details) => log('debug', message, details),
    info: (message, details) => log('info', message, details),
    warn: (message, details) => log('warn', message, details),
    error: (message, details) => log('error', message, details),
  };
}
