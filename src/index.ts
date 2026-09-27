import { createServer } from './server.js';
import { loadConfig } from './config/index.js';
import { prisma } from './infrastructure/database/prisma/prisma.client.js';

const env = loadConfig();

const server = createServer();

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log('Database connected successfully');

    server.listen(env.port, () => {
      console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

function shutdown(signal: string): void {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed.');

    void prisma.$disconnect().then(() => {
      console.log('Database connection closed.');

      process.exit(0);
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
