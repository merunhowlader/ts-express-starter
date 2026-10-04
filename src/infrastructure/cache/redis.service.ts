import type { ICache } from '../../common/interfaces/cache.interface.js';
import type { RedisClient } from './redis.client.js';

export class RedisService implements ICache {
  public constructor(private readonly client: RedisClient) {}

  public async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
