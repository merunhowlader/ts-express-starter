export interface RedisConfig {
  url: string;
}

export function createRedisConfig(url: string): RedisConfig {
  return {
    url,
  };
}
