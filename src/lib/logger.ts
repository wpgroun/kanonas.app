type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, data?: unknown) {
  const isProd = process.env.NODE_ENV === 'production';
  if (level === 'debug' && isProd) return;

  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;

  if (level === 'error') {
    console.error(prefix, message, data ?? '');
  } else if (level === 'warn') {
    console.warn(prefix, message, data ?? '');
  } else {
    console.log(prefix, message, data ?? '');
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warn', msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
};
