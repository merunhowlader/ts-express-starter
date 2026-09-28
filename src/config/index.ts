import { loadEnvConfig } from './env.config.js';

export type AppConfig = {
  nodeEnv: ReturnType<typeof loadEnvConfig>['NODE_ENV'];
  port: ReturnType<typeof loadEnvConfig>['PORT'];
  databaseUrl: ReturnType<typeof loadEnvConfig>['DATABASE_URL'];
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
};

export function loadConfig(): AppConfig {
  const env = loadEnvConfig();

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
  };
}
