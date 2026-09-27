import { loadEnvConfig } from './env.config.js';

export type AppConfig = {
  nodeEnv: ReturnType<typeof loadEnvConfig>['NODE_ENV'];
  port: ReturnType<typeof loadEnvConfig>['PORT'];
  databaseUrl: ReturnType<typeof loadEnvConfig>['DATABASE_URL'];
};

export function loadConfig(): AppConfig {
  const env = loadEnvConfig();

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
  };
}
