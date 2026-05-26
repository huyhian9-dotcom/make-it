import knex from 'knex';
import path from 'path';
import { env } from './env.js';

function createDb(opts?: { filename?: string }) {
  const client = env.DB_CLIENT === 'pg' ? 'pg' : 'better-sqlite3';

  if (client === 'pg') {
    return knex({
      client: 'pg',
      connection: env.DATABASE_URL,
    });
  }

  const filename = opts?.filename ?? path.resolve(env.DATABASE_FILE);
  return knex({
    client: 'better-sqlite3',
    connection: { filename },
    useNullAsDefault: true,
  });
}

export const db = createDb();

export { createDb };
