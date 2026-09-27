import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),

  PORT: z.coerce.number().int().min(1).max(65535),

  DATABASE_URL: z.string().min(1),
});

export function loadEnvConfig() {
  return envSchema.parse(process.env);
}
