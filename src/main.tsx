import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { installBrowserLogging } from './logging/browser';
import { loadLoggingConfig } from './logging/config';
import { createHttpLogSink } from './logging/http';
import { createLogger } from './logging/logger';
import { createLocalFileSink } from './logging/local-file';
import './index.css';

const config = await loadLoggingConfig(import.meta.env.VITE_LOG_LEVEL, import.meta.env.DEV);
const logger = createLogger({
  level: config.level,
  sink: config.endpoint
    ? createHttpLogSink(config.endpoint)
    : createLocalFileSink(import.meta.env.DEV, window.location),
});
const removeBrowserLogging = installBrowserLogging(logger);
import.meta.hot?.dispose(removeBrowserLogging);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement, {
  onUncaughtError: (error, errorInfo) => {
    logger.error('react.uncaught_error', {
      error,
      context: { pathname: window.location.pathname, componentStack: errorInfo.componentStack },
    });
  },
  onCaughtError: (error, errorInfo) => {
    logger.error('react.caught_error', {
      error,
      context: { pathname: window.location.pathname, componentStack: errorInfo.componentStack },
    });
  },
  onRecoverableError: (error, errorInfo) => {
    logger.warn('react.recoverable_error', {
      error,
      context: { pathname: window.location.pathname, componentStack: errorInfo.componentStack },
    });
  },
}).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

logger.info('app.initialized', { context: { pathname: window.location.pathname } });
