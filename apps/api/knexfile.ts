import type { Knex } from 'knex';
import path from 'path';

// Load env only when running knex CLI directly
import 'dotenv/config';

const DB_CLIENT = process.env.DB_CLIENT ?? 'better-sqlite3';
const DATABASE_FILE = process.env.DATABASE_FILE ?? './make-it.sqlite';
const DATABASE_URL = process.env.DATABASE_URL ?? '';

const sqliteConfig: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: path.resolve(DATABASE_FILE),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'src/migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/seeds'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

const pgConfig: Knex.Config = {
  client: 'pg',
  connection: DATABASE_URL,
  migrations: {
    directory: path.resolve(__dirname, 'src/migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/seeds'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

const config: Knex.Config = DB_CLIENT === 'pg' ? pgConfig : sqliteConfig;

export default config;
