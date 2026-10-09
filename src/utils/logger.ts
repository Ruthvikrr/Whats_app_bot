import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'authorization',
      'headers.authorization',
      'access_token',
      'WHATSAPP_ACCESS_TOKEN',
      'META_APP_SECRET',
      'META_VERIFY_TOKEN',
      'app_secret',
      'verify_token',
      '*.access_token',
      '*.WHATSAPP_ACCESS_TOKEN',
      '*.META_APP_SECRET',
    ],
    censor: '[REDACTED]',
  },
  transport:
    !isProduction && !isTest
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
