import { app } from './app.js';
import { env } from './config/env.js';
import { COMPANY_NAME } from './config/constants.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`==================================================`);
  logger.info(`🚀 WhatsApp Business Bot for ${COMPANY_NAME}`);
  logger.info(`📡 Server running on http://0.0.0.0:${PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Webhook Endpoint: http://0.0.0.0:${PORT}/webhook`);
  logger.info(`❤️  Health Check: http://0.0.0.0:${PORT}/health`);
  logger.info(`==================================================`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  logger.error({ err }, `❌ Server failed to start on port ${PORT}`);
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by another process. Please set PORT in .env to an available port (e.g. PORT=3005).`);
  }
  process.exit(1);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Closing HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 10s if connections refuse to terminate
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
