import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, setupTestDb, teardownTestDb } from './helpers/db.js';
import { seed } from '../seeds/01_demo.js';

const db = createTestDb();

beforeAll(async () => {
  await setupTestDb(db);
  await seed(db);
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Demo seed', () => {
  it('creates 1 user', async () => {
    const count = await db('users').count('id as c').first();
    expect(Number(count?.c)).toBe(1);
  });

  it('creates 2 labels', async () => {
    const count = await db('labels').count('id as c').first();
    expect(Number(count?.c)).toBe(2);
  });

  it('creates 7 personal tasks + 4 group tasks = 11 tasks', async () => {
    const count = await db('tasks').count('id as c').first();
    expect(Number(count?.c)).toBe(11);
  });

  it('creates 9 subtasks for the shopping task', async () => {
    const count = await db('subtasks').count('id as c').first();
    expect(Number(count?.c)).toBe(9);
  });

  it('creates 4 groups', async () => {
    const count = await db('groups').count('id as c').first();
    expect(Number(count?.c)).toBe(4);
  });

  it('creates 4 group memberships (owner)', async () => {
    const count = await db('group_members').count('id as c').first();
    expect(Number(count?.c)).toBe(4);
  });

  it('creates 4 routine blocks', async () => {
    const count = await db('routine_blocks').count('id as c').first();
    expect(Number(count?.c)).toBe(4);
  });

  it('seed is idempotent (run twice, same counts)', async () => {
    await seed(db);
    const count = await db('users').count('id as c').first();
    expect(Number(count?.c)).toBe(1);
  });
});
