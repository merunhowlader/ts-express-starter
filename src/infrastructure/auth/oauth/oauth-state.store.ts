import { oauthStateKey } from '../../cache/redis.keys.js';
import type { RedisService } from '../../cache/redis.service.js';
import type { OAuthTransientData } from '../../cache/redis.types.js';

export class OAuthStateStore {
  public constructor(private readonly redis: RedisService) {}

  public async save(state: string, data: OAuthTransientData, ttlSeconds: number): Promise<void> {
    await this.redis.set(oauthStateKey(state), data, ttlSeconds);
  }

  public async consume(state: string): Promise<OAuthTransientData | null> {
    const key = oauthStateKey(state);

    const value = await this.redis.get<OAuthTransientData>(key);

    if (value === null) {
      return null;
    }

    await this.redis.delete(key);

    return value;
  }
}
