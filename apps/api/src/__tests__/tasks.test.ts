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
  const r1 = await request(app).post('/api/v1/auth/register').send({ name: 'TaskUser1', email: 'tasks1@test.com', password: 'pass123' });
  token = r1.body.data.token;
  const r2 = await request(app).post('/api/v1/auth/register').send({ name: 'TaskUser2', email: 'tasks2@test.com', password: 'pass123' });
  token2 = r2.body.data.token;
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Tasks', () => {
  let taskId: string;

  it('POST /tasks → 201 simple todo', async () => {
    const res = await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Task');
    expect(res.body.data.kind).toBe('todo');
    expect(res.body.data.status).toBe('open');
    taskId = res.body.data.id;
  });

  it('POST /tasks with subtasks → hydrated in response', async () => {
    const res = await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Shopping',
        subtasks: [
          { title: 'Milk', done: false },
          { title: 'Eggs', done: true },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.subtasks).toHaveLength(2);
    expect(res.body.data.subtasks[0].title).toBe('Milk');
    expect(res.body.data.subtasks[1].done).toBe(true);
  });

  it('GET /tasks → includes created tasks', async () => {
    const res = await request(app).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const task = res.body.data.find((t: { id: string }) => t.id === taskId);
    expect(task).toBeDefined();
  });

  it('GET /tasks?kind=habit → only habits', async () => {
    await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Drink water', kind: 'habit', recurrence: { freq: 'daily' } });
    const res = await request(app).get('/api/v1/tasks?kind=habit').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { kind: string }) => t.kind === 'habit')).toBe(true);
  });

  it('GET /tasks?from=&to= → date range filter', async () => {
    await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Deadline task', kind: 'deadline', dueDate: '2026-09-15' });
    const res = await request(app).get('/api/v1/tasks?from=2026-09-01&to=2026-09-30').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.data.map((t: { title: string }) => t.title);
    expect(titles).toContain('Deadline task');
  });

  it('PATCH /tasks/:id/complete with done=true → status=done', async () => {
    const res = await request(app).patch(`/api/v1/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${token}`).send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
    expect(res.body.data.completedAt).not.toBeNull();
  });

  it('PATCH /tasks/:id/complete with done=false → status=open', async () => {
    const res = await request(app).patch(`/api/v1/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${token}`).send({ done: false });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('open');
    expect(res.body.data.completedAt).toBeNull();
  });

  it('GET /tasks/:id from different user → 403/404', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([403, 404]).toContain(res.status);
  });

  it('DELETE /tasks/:id → soft delete (not in list anymore)', async () => {
    const createRes = await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete' });
    const id = createRes.body.data.id;
    await request(app).delete(`/api/v1/tasks/${id}`).set('Authorization', `Bearer ${token}`);
    const listRes = await request(app).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.data.find((t: { id: string }) => t.id === id)).toBeUndefined();
  });
});
