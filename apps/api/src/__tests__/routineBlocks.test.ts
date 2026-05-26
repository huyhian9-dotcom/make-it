import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestDb, setupTestDb, teardownTestDb } from './helpers/db.js';
import { createTestApp } from './helpers/testApp.js';

const db = createTestDb();
const app = createTestApp(db);

let token: string;

beforeAll(async () => {
  await setupTestDb(db);
  const r = await request(app).post('/api/v1/auth/register').send({ name: 'RoutineUser', email: 'routine@test.com', password: 'pass123' });
  token = r.body.data.token;
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Routine Blocks', () => {
  let blockId: string;

  it('POST /routine-blocks → 201', async () => {
    const res = await request(app).post('/api/v1/routine-blocks').set('Authorization', `Bearer ${token}`)
      .send({ label: 'Work', color: '#FEF08A', startTime: '09:00', endTime: '17:00' });
    expect(res.status).toBe(201);
    expect(res.body.data.label).toBe('Work');
    expect(res.body.data.startTime).toBe('09:00');
    blockId = res.body.data.id;
  });

  it('POST second block with earlier time', async () => {
    await request(app).post('/api/v1/routine-blocks').set('Authorization', `Bearer ${token}`)
      .send({ label: 'Morning', color: '#BFDBFE', startTime: '06:00' });
  });

  it('GET /routine-blocks → ordered by startTime', async () => {
    const res = await request(app).get('/api/v1/routine-blocks').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const blocks = res.body.data;
    expect(blocks.length).toBe(2);
    expect(blocks[0].startTime).toBe('06:00');
    expect(blocks[1].startTime).toBe('09:00');
  });

  it('PATCH /routine-blocks/:id → updates label', async () => {
    const res = await request(app).patch(`/api/v1/routine-blocks/${blockId}`).set('Authorization', `Bearer ${token}`)
      .send({ label: 'Deep Work' });
    expect(res.status).toBe(200);
    expect(res.body.data.label).toBe('Deep Work');
  });

  it('DELETE /routine-blocks/:id → soft deleted, not in list', async () => {
    await request(app).delete(`/api/v1/routine-blocks/${blockId}`).set('Authorization', `Bearer ${token}`);
    const res = await request(app).get('/api/v1/routine-blocks').set('Authorization', `Bearer ${token}`);
    expect(res.body.data.find((b: { id: string }) => b.id === blockId)).toBeUndefined();
  });
});
