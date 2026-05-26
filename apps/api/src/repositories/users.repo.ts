import type { Knex } from 'knex';
import type { User, UserPreferences } from '@makeit/shared';
import { db } from '../config/db.js';
import { generateId } from '../utils/uuid.js';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  bio: string | null;
  avatar_url: string | null;
  preferences: string | UserPreferences;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | null;
}

function parsePreferences(raw: string | UserPreferences | null | undefined): UserPreferences {
  if (!raw) return { theme: 'light', push: false, cloudSync: false };
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as UserPreferences; } catch { return { theme: 'light', push: false, cloudSync: false }; }
  }
  return raw;
}

function toISO(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    preferences: parsePreferences(row.preferences),
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

export interface UserWithHash extends User {
  passwordHash: string;
}

export function rowToUserWithHash(row: UserRow): UserWithHash {
  return { ...rowToUser(row), passwordHash: row.password_hash };
}

export const usersRepo = {
  async findByEmail(email: string, knexInst: Knex = db): Promise<UserWithHash | null> {
    const row = await knexInst<UserRow>('users')
      .where({ email })
      .whereNull('deleted_at')
      .first();
    return row ? rowToUserWithHash(row) : null;
  },

  async findById(id: string, knexInst: Knex = db): Promise<UserWithHash | null> {
    const row = await knexInst<UserRow>('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return row ? rowToUserWithHash(row) : null;
  },

  async create(
    data: { name: string; email: string; passwordHash: string },
    knexInst: Knex = db,
  ): Promise<User> {
    const id = generateId();
    const now = new Date().toISOString();
    const prefs: UserPreferences = { theme: 'light', push: false, cloudSync: false };
    await knexInst('users').insert({
      id,
      name: data.name,
      email: data.email,
      password_hash: data.passwordHash,
      bio: null,
      avatar_url: null,
      preferences: JSON.stringify(prefs),
      created_at: now,
      updated_at: now,
    });
    const row = await knexInst<UserRow>('users').where({ id }).first();
    return rowToUser(row!);
  },

  async update(
    id: string,
    data: Partial<{ name: string; bio: string | null; avatarUrl: string | null; preferences: UserPreferences }>,
    knexInst: Knex = db,
  ): Promise<User | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) update.name = data.name;
    if ('bio' in data) update.bio = data.bio;
    if ('avatarUrl' in data) update.avatar_url = data.avatarUrl;
    if (data.preferences !== undefined) update.preferences = JSON.stringify(data.preferences);

    await knexInst('users').where({ id }).update(update);
    const row = await knexInst<UserRow>('users').where({ id }).first();
    return row ? rowToUser(row) : null;
  },
};
