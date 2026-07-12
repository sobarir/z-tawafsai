import type { Params } from 'nestjs-pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Structured logging with pino (via nestjs-pino).
 *
 * - pino-http reuses Fastify's request id (a UUID generated in main.ts,
 *   honoring incoming x-request-id and echoed back as a response header),
 *   so logs, error envelopes and clients all share the same correlation id.
 * - Secrets are redacted: cookies, set-cookie and authorization never
 *   reach the logs.
 * - Dev: human-readable pino-pretty. Prod: JSON lines for your log pipeline.
 */
export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    redact: {
      paths: [
        'req.headers.cookie',
        'req.headers.authorization',
        'res.headers["set-cookie"]',
        '*.password',
        '*.accessToken',
        '*.refreshToken',
      ],
      censor: '[REDACTED]',
    },
    customProps: () => ({ service: 'api' }),
    autoLogging: {
      // Health checks would flood the logs
      ignore: (req) => req.url === '/health',
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname,service',
          },
        },
  },
};
