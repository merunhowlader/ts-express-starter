import { createServer } from './server.js';
import { loadConfig } from './config/index.js';
import { prisma } from './infrastructure/database/prisma/prisma.client.js';
import { redisClient } from './app/container.js';

const env = loadConfig();

const server = createServer();

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log(
      'Database connected successfully',
    );

    server.listen(env.port, () => {
      console.log(
        `Server is running on port ${env.port} in ${env.nodeEnv} mode`,
      );
    });

    try {
      await redisClient.connect();

      console.log(
        'Redis connected successfully',
      );
    } catch (error: unknown) {
      console.warn(
        'Redis is unavailable. Application will continue without Redis:',
        error,
      );
    }
  } catch (error: unknown) {
    console.error(
      'Failed to start application:',
      error,
    );

    if (redisClient.isOpen) {
      await redisClient.quit().catch(
        () => undefined,
      );
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

  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed.');

    void Promise.all([
      prisma.$disconnect(),
      redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
    ])
      .then(() => {
        console.log('Database and Redis connections closed.');

        process.exit(0);
      })
      .catch((error: unknown) => {
        console.error('Error during shutdown:', error);

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
