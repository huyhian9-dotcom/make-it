import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDb, setupTestDb, teardownTestDb } from './helpers/db.js';
import { createTestApp } from './helpers/testApp.js';

const db = createTestDb();
const app = createTestApp(db);

let token: string;
let token2: string;

beforeAll(async () => {
  await setupTestDb(db);
  const r1 = await request(app).post('/api/v1/auth/register').send({ name: 'User1', email: 'labels1@test.com', password: 'pass123' });
  token = r1.body.data.token;
  const r2 = await request(app).post('/api/v1/auth/register').send({ name: 'User2', email: 'labels2@test.com', password: 'pass123' });
  token2 = r2.body.data.token;
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Labels CRUD', () => {
  let labelId: string;

  it('POST /labels → 201', async () => {
    const res = await request(app).post('/api/v1/labels').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Work', color: '#FF0000' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Work');
    labelId = res.body.data.id;
  });

  it('GET /labels → only user labels', async () => {
    await request(app).post('/api/v1/labels').set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Other', color: '#00FF00' });
    const res = await request(app).get('/api/v1/labels').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const labels = res.body.data;
    expect(labels.every((l: { userId: string }) => l.userId !== undefined)).toBe(true);
    expect(labels.find((l: { name: string }) => l.name === 'Other')).toBeUndefined();
  });

  it('PATCH /labels/:id → updates name', async () => {
    const res = await request(app).patch(`/api/v1/labels/${labelId}`).set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Work' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Work');
  });

  it('PATCH /labels/:id from different user → 404', async () => {
    const res = await request(app).patch(`/api/v1/labels/${labelId}`).set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Stolen' });
    expect(res.status).toBe(404);
  });

  it('DELETE /labels/:id → soft deletes', async () => {
    const res = await request(app).delete(`/api/v1/labels/${labelId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const listRes = await request(app).get('/api/v1/labels').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.data.find((l: { id: string }) => l.id === labelId)).toBeUndefined();
  });
});
