import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(8088),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(16).default('bamboo_diplomat_dev_secret_key_change_in_prod'),
  GM_PASSWORD: z.string().min(6).default('bambooGM2026!'),
  SESSION_PIN: z.string().min(4).default('HCM202'),
  CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const config: Config = ConfigSchema.parse(process.env);
