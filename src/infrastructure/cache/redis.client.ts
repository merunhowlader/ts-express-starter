import { createClient, type RedisClientType } from 'redis';

import { logger } from '../logger/logger.js';

export type RedisClient = RedisClientType;

export function createRedisClient(url: string): RedisClient {
  const client = createClient({
    url,

    socket: {
      reconnectStrategy: (retries: number) => {
        const delay = Math.min(retries * 100, 3000);

        return delay;
      },
    },
  });

  client.on('error', (error) => {
    logger.error('Redis client error', error);
  });

  return client;
}
