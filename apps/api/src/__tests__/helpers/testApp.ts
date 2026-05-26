import express from 'express';
import cors from 'cors';
import type { Knex } from 'knex';
import { Router } from 'express';
import { errorMiddleware } from '../../middlewares/error.js';
import { requireAuth } from '../../middlewares/auth.js';
import { verifyToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/errors.js';
import { ok } from '../../utils/response.js';

// Auth routes
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { authService } from '../../services/auth.service.js';
import { usersService } from '../../services/users.service.js';
import { labelsService } from '../../services/labels.service.js';
import { tasksService } from '../../services/tasks.service.js';
import { groupsService } from '../../services/groups.service.js';
import { routineBlocksService } from '../../services/routineBlocks.service.js';
import { created } from '../../utils/response.js';

/**
 * Creates a test Express app with all routes wired to the given knex instance.
 * This allows tests to use an in-memory SQLite DB.
 */
export function createTestApp(db: Knex) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok' });
  });

  // --- Auth ---
  const registerSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) });
  const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

  router.post('/auth/register', validate(registerSchema), async (req, res, next) => {
    try { created(res, await authService.register(req.body, db)); } catch (e) { next(e); }
  });
  router.post('/auth/login', validate(loginSchema), async (req, res, next) => {
    try { ok(res, await authService.login(req.body, db)); } catch (e) { next(e); }
  });
  router.get('/auth/me', requireAuth, async (req, res, next) => {
    try { ok(res, await authService.me(req.user!.id, db)); } catch (e) { next(e); }
  });

  // --- Users ---
  const updateUserSchema = z.object({ name: z.string().min(1).optional(), bio: z.string().nullable().optional(), avatarUrl: z.string().nullable().optional() });
  const updatePrefsSchema = z.object({ theme: z.enum(['light', 'dark']).optional(), push: z.boolean().optional(), cloudSync: z.boolean().optional() });

  router.get('/users/me', requireAuth, async (req, res, next) => {
    try { ok(res, await usersService.getMe(req.user!.id, db)); } catch (e) { next(e); }
  });
  router.patch('/users/me', requireAuth, validate(updateUserSchema), async (req, res, next) => {
    try { ok(res, await usersService.updateMe(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });
  router.patch('/users/me/preferences', requireAuth, validate(updatePrefsSchema), async (req, res, next) => {
    try { ok(res, await usersService.updatePreferences(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });

  // --- Labels ---
  const createLabelSchema = z.object({ name: z.string().min(1), color: z.string().min(1) });
  const updateLabelSchema = createLabelSchema.partial();

  router.get('/labels', requireAuth, async (req, res, next) => {
    try { ok(res, await labelsService.list(req.user!.id, db)); } catch (e) { next(e); }
  });
  router.post('/labels', requireAuth, validate(createLabelSchema), async (req, res, next) => {
    try { created(res, await labelsService.create(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });
  router.patch('/labels/:id', requireAuth, validate(updateLabelSchema), async (req, res, next) => {
    try { ok(res, await labelsService.update(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.delete('/labels/:id', requireAuth, async (req, res, next) => {
    try { await labelsService.delete(req.user!.id, req.params.id, db); ok(res, null); } catch (e) { next(e); }
  });

  // --- Tasks ---
  const recurrenceSchema = z.object({ freq: z.enum(['daily', 'weekly']), daysOfWeek: z.array(z.number()).optional() });
  const createTaskSchema = z.object({
    title: z.string().min(1), notes: z.string().nullable().optional(),
    kind: z.enum(['todo', 'habit', 'deadline']).optional(),
    groupId: z.string().nullable().optional(), labelId: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(), startsOn: z.string().nullable().optional(), endsOn: z.string().nullable().optional(),
    recurrence: recurrenceSchema.nullable().optional(),
    groupTaskType: z.enum(['livre', 'delegada', 'mutirao', 'acao_global']).nullable().optional(),
    assignees: z.array(z.string()).optional(),
    subtasks: z.array(z.object({ title: z.string().min(1), done: z.boolean().optional(), position: z.number().optional() })).optional(),
  });
  const updateTaskSchema = createTaskSchema.partial();
  const subtaskSchema = z.object({ title: z.string().min(1), done: z.boolean().optional(), position: z.number().optional() });
  const updateSubtaskSchema = subtaskSchema.partial();

  router.get('/tasks', requireAuth, async (req, res, next) => {
    try {
      const { from, to, kind, status } = req.query as Record<string, string | undefined>;
      const groupId = (req.query.groupId ?? req.query.group_id) as string | undefined;
      const labelId = (req.query.labelId ?? req.query.label_id) as string | undefined;
      ok(res, await tasksService.list(req.user!.id, { from, to, kind: kind as never, groupId, status: status as never, labelId }, db));
    } catch (e) { next(e); }
  });
  router.post('/tasks', requireAuth, validate(createTaskSchema), async (req, res, next) => {
    try { created(res, await tasksService.create(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });
  router.get('/tasks/:id', requireAuth, async (req, res, next) => {
    try { ok(res, await tasksService.get(req.user!.id, req.params.id, db)); } catch (e) { next(e); }
  });
  router.patch('/tasks/:id', requireAuth, validate(updateTaskSchema), async (req, res, next) => {
    try { ok(res, await tasksService.update(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.patch('/tasks/:id/complete', requireAuth, validate(z.object({ done: z.boolean() })), async (req, res, next) => {
    try { ok(res, await tasksService.complete(req.user!.id, req.params.id, req.body.done, db)); } catch (e) { next(e); }
  });
  router.delete('/tasks/:id', requireAuth, async (req, res, next) => {
    try { await tasksService.softDelete(req.user!.id, req.params.id, db); ok(res, null); } catch (e) { next(e); }
  });
  router.post('/tasks/:id/subtasks', requireAuth, validate(subtaskSchema), async (req, res, next) => {
    try { created(res, await tasksService.addSubtask(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.patch('/subtasks/:id', requireAuth, validate(updateSubtaskSchema), async (req, res, next) => {
    try { ok(res, await tasksService.updateSubtask(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.delete('/subtasks/:id', requireAuth, async (req, res, next) => {
    try { await tasksService.deleteSubtask(req.user!.id, req.params.id, db); ok(res, null); } catch (e) { next(e); }
  });

  // --- Groups ---
  const createGroupSchema = z.object({ name: z.string().min(1), icon: z.string().min(1) });
  const updateGroupSchema = createGroupSchema.partial();
  const inviteSchema = z.object({ email: z.string().email().nullable().optional() });

  router.get('/groups', requireAuth, async (req, res, next) => {
    try { ok(res, await groupsService.list(req.user!.id, db)); } catch (e) { next(e); }
  });
  router.post('/groups', requireAuth, validate(createGroupSchema), async (req, res, next) => {
    try { created(res, await groupsService.create(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });
  router.get('/groups/:id', requireAuth, async (req, res, next) => {
    try { ok(res, await groupsService.get(req.user!.id, req.params.id, db)); } catch (e) { next(e); }
  });
  router.patch('/groups/:id', requireAuth, validate(updateGroupSchema), async (req, res, next) => {
    try { ok(res, await groupsService.update(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.delete('/groups/:id', requireAuth, async (req, res, next) => {
    try { await groupsService.delete(req.user!.id, req.params.id, db); ok(res, null); } catch (e) { next(e); }
  });
  router.get('/groups/:id/tasks', requireAuth, async (req, res, next) => {
    try { ok(res, await groupsService.listTasks(req.user!.id, req.params.id, db)); } catch (e) { next(e); }
  });
  router.post('/groups/:id/invites', requireAuth, validate(inviteSchema), async (req, res, next) => {
    try { created(res, await groupsService.createInvite(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });

  // --- Invites accept ---
  router.post('/invites/:token/accept', (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next(new AppError('UNAUTHORIZED', 'Missing token'));
    try {
      const payload = verifyToken(header.slice(7));
      req.user = { id: payload.sub };
    } catch { return next(new AppError('UNAUTHORIZED', 'Invalid token')); }
    groupsService.acceptInvite(req.params.token, req.user!.id, db).then((m) => ok(res, m)).catch(next);
  });

  // --- Routine blocks ---
  const createBlockSchema = z.object({
    label: z.string().min(1), color: z.string().min(1),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    weekdayMask: z.number().int().optional(),
  });
  const updateBlockSchema = createBlockSchema.partial();

  router.get('/routine-blocks', requireAuth, async (req, res, next) => {
    try { ok(res, await routineBlocksService.list(req.user!.id, db)); } catch (e) { next(e); }
  });
  router.post('/routine-blocks', requireAuth, validate(createBlockSchema), async (req, res, next) => {
    try { created(res, await routineBlocksService.create(req.user!.id, req.body, db)); } catch (e) { next(e); }
  });
  router.patch('/routine-blocks/:id', requireAuth, validate(updateBlockSchema), async (req, res, next) => {
    try { ok(res, await routineBlocksService.update(req.user!.id, req.params.id, req.body, db)); } catch (e) { next(e); }
  });
  router.delete('/routine-blocks/:id', requireAuth, async (req, res, next) => {
    try { await routineBlocksService.delete(req.user!.id, req.params.id, db); ok(res, null); } catch (e) { next(e); }
  });

  app.use('/api/v1', router);
  app.use(errorMiddleware);

  return app;
}
