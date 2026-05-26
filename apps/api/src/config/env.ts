import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
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
