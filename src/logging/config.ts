import { logLevels, resolveLogLevel, type LogLevel } from './logger.ts';

export interface LoggingConfig {
  level: LogLevel;
  endpoint?: string;
}

/** Accept only same-origin paths, so browser logs cannot be redirected off-site. */
export function resolveLoggingConfig(
  value: unknown,
  buildLevel: unknown,
  development: boolean,
): LoggingConfig {
  const settings = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  const level = resolveLogLevel(
    logLevels.includes(settings.level as LogLevel) ? settings.level : buildLevel,
    development,
  );
  const endpoint = settings.endpoint;
  return {
    level,
    ...(typeof endpoint === 'string'
      && /^\/(?!\/)[^?#\\]*$/.test(endpoint)
      && endpoint !== '/'
      ? { endpoint } : {}),
  };
}

export async function loadLoggingConfig(
  buildLevel: unknown,
  development: boolean,
  send: typeof fetch = fetch,
): Promise<LoggingConfig> {
  const fallback = resolveLoggingConfig(undefined, buildLevel, development);
  try {
    const response = await send('/logging-config.json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return fallback;
    return resolveLoggingConfig(await response.json(), buildLevel, development);
  } catch {
    return fallback;
  }
}
