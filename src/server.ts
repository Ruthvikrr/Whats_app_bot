import { app } from './app.js';
import { env } from './config/env.js';
import { COMPANY_NAME } from './config/constants.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚀 WhatsApp Business Bot for ${COMPANY_NAME}`);
  logger.info(`📡 Server running on http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Webhook Endpoint: http://localhost:${PORT}/webhook`);
  logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
  logger.info(`==================================================`);
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
