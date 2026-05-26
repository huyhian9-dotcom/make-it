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
  const r1 = await request(app).post('/api/v1/auth/register').send({ name: 'GroupUser1', email: 'groups1@test.com', password: 'pass123' });
  token = r1.body.data.token;
  const r2 = await request(app).post('/api/v1/auth/register').send({ name: 'GroupUser2', email: 'groups2@test.com', password: 'pass123' });
  token2 = r2.body.data.token;
});

afterAll(async () => {
  await teardownTestDb(db);
});

describe('Groups', () => {
  let groupId: string;
  let inviteToken: string;

  it('POST /groups → 201 and owner is member', async () => {
    const res = await request(app).post('/api/v1/groups').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dev Team', icon: 'code' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Dev Team');
    groupId = res.body.data.id;

    // Get group with role
    const getRes = await request(app).get(`/api/v1/groups/${groupId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.body.data.role).toBe('owner');
    expect(getRes.body.data.memberCount).toBe(1);
  });

  it('GET /groups → only groups where user is member', async () => {
    // Create group with user2 (user1 not member)
    await request(app).post('/api/v1/groups').set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Other Group', icon: 'star' });

    const res = await request(app).get('/api/v1/groups').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const names = res.body.data.map((g: { name: string }) => g.name);
    expect(names).toContain('Dev Team');
    expect(names).not.toContain('Other Group');
  });

  it('GET /groups/:id/tasks by non-member → 403', async () => {
    const res = await request(app).get(`/api/v1/groups/${groupId}/tasks`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });

  it('POST /groups/:id/invites → returns token', async () => {
    const res = await request(app).post(`/api/v1/groups/${groupId}/invites`)
      .set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.status).toBe('pending');
    inviteToken = res.body.data.token;
  });

  it('POST /invites/:token/accept → adds membership', async () => {
    const res = await request(app).post(`/api/v1/invites/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('member');

    // Now token2 should see the group
    const listRes = await request(app).get('/api/v1/groups').set('Authorization', `Bearer ${token2}`);
    const names = listRes.body.data.map((g: { name: string }) => g.name);
    expect(names).toContain('Dev Team');
  });

  it('GET /groups/:id/tasks by new member → 200', async () => {
    const res = await request(app).get(`/api/v1/groups/${groupId}/tasks`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /groups/:id by non-owner → 403', async () => {
    const res = await request(app).delete(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});
