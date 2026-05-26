import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDb, setupTestDb, teardownTestDb } from './helpers/db.js';
import { createTestApp } from './helpers/testApp.js';

const db = createTestDb();
const app = createTestApp(db);

let token: string;

beforeAll(async () => {
  await setupTestDb(db);
  const r = await request(app).post('/api/v1/auth/register').send({ name: 'ProfileUser', email: 'profile@test.com', password: 'pass123' });
  token = r.body.data.token;
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Users', () => {
  it('GET /users/me → returns current user', async () => {
    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('profile@test.com');
  });

  it('PATCH /users/me → updates bio', async () => {
    const res = await request(app).patch('/api/v1/users/me').set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Developer' });
    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe('Developer');
  });

  it('PATCH /users/me/preferences → merges preferences', async () => {
    // First set push=true
    await request(app).patch('/api/v1/users/me/preferences').set('Authorization', `Bearer ${token}`)
      .send({ push: true });

    // Then set cloudSync=true — push should still be true
    const res = await request(app).patch('/api/v1/users/me/preferences').set('Authorization', `Bearer ${token}`)
      .send({ cloudSync: true });
    expect(res.status).toBe(200);
    expect(res.body.data.preferences.push).toBe(true);
    expect(res.body.data.preferences.cloudSync).toBe(true);
  });

  it('PATCH /users/me/preferences theme → updates theme', async () => {
    const res = await request(app).patch('/api/v1/users/me/preferences').set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });
    expect(res.status).toBe(200);
    expect(res.body.data.preferences.theme).toBe('dark');
  });
});
