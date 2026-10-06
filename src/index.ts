import { createServer } from './server.js';
import { loadConfig } from './config/index.js';
import { prisma } from './infrastructure/database/prisma/prisma.client.js';
import { redisClient } from './app/container.js';
import { logger } from './infrastructure/logger/logger.js';
const env = loadConfig();

const server = createServer();

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    logger.info('Database connected successfully');

    server.listen(env.port, '0.0.0.0', () => {
      logger.info(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    try {
      await redisClient.connect();

      logger.info('Redis connected successfully');
    } catch (error: unknown) {
      logger.error('Redis is unavailable. Application will continue without Redis:', error);
    }
  } catch (error: unknown) {
    logger.error('Failed to start application:', error);

    if (redisClient.isOpen) {
      await redisClient.quit().catch(() => undefined);
    }

    await prisma.$disconnect();

    process.exit(1);
  }
};
let isShuttingDown = false;
function shutdown(signal: string): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed.');

    void Promise.all([
      prisma.$disconnect(),
      redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
    ])
      .then(() => {
        logger.info('Database and Redis connections closed.');

        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error('Error during shutdown:', error);

        process.exit(1);
      });
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

void startServer();
