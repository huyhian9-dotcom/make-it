import knex from 'knex';
import path from 'path';

// Resolve from apps/api root (cwd when running vitest)
function migrationsDir() {
  return path.resolve(process.cwd(), 'src/migrations');
}

export function createTestDb() {
  return knex({
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
  });
}

export async function setupTestDb(knexInst: ReturnType<typeof knex>) {
  await knexInst.migrate.latest({
    directory: migrationsDir(),
    extension: 'ts',
    loadExtensions: ['.ts'],
  });
}

export async function teardownTestDb(knexInst: ReturnType<typeof knex>) {
  await knexInst.destroy();
}
