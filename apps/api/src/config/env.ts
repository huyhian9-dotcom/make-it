import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.string().default('development'),
  JWT_SECRET: z.string().min(1).default('dev-secret-change-me'),
  DB_CLIENT: z.enum(['sqlite3', 'better-sqlite3', 'pg']).default('better-sqlite3'),
  DATABASE_FILE: z.string().default('./make-it.sqlite'),
  DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || env.JWT_SECRET === 'dev-secret-change-me') {
    console.error('[make-it] FATAL: JWT_SECRET must be set to a strong secret in production. Exiting.');
    process.exit(1);
  }
} else {
  if (env.JWT_SECRET === 'dev-secret-change-me') {
    console.warn('[make-it] usando JWT_SECRET de desenvolvimento — defina JWT_SECRET em produção');
  }
}
