import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDb, setupTestDb, teardownTestDb } from './helpers/db.js';
import { createTestApp } from './helpers/testApp.js';

const db = createTestDb();
const app = createTestApp(db);

beforeAll(async () => {
  await setupTestDb(db);
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Auth', () => {
  it('POST /auth/register → 201 with token and user (no password_hash)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('POST /auth/register with duplicate email → 409', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Another', email: 'dup@example.com', password: 'password123',
    });
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Another2', email: 'dup@example.com', password: 'password123',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('POST /auth/login with wrong password → 401', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Test', email: 'login@example.com', password: 'correctpassword',
    });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /auth/me without token → 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me with valid token → 200', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Me User', email: 'me@example.com', password: 'password123',
    });
    const token = reg.body.data.token;
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@example.com');
  });

  it('POST /auth/login with correct creds → 200 with token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com', password: 'correctpassword',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
