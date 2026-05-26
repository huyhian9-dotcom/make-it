import type { Request, Response, NextFunction } from 'express';
import { tasksService } from '../services/tasks.service.js';
import { ok, created } from '../utils/response.js';

export const tasksController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, kind, status, labelId } = req.query as Record<string, string | undefined>;
      const groupId = (req.query.groupId ?? req.query.group_id) as string | undefined;
      const tasks = await tasksService.list(req.user!.id, { from, to, kind: kind as never, groupId, status: status as never, labelId });
      ok(res, tasks);
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.get(req.user!.id, req.params.id);
      ok(res, task);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.create(req.user!.id, req.body);
      created(res, task);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.update(req.user!.id, req.params.id, req.body);
      ok(res, task);
    } catch (err) { next(err); }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.complete(req.user!.id, req.params.id, req.body.done);
      ok(res, task);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await tasksService.softDelete(req.user!.id, req.params.id);
      ok(res, null);
    } catch (err) { next(err); }
  },

  async addSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const subtask = await tasksService.addSubtask(req.user!.id, req.params.id, req.body);
      created(res, subtask);
    } catch (err) { next(err); }
  },

  async updateSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const subtask = await tasksService.updateSubtask(req.user!.id, req.params.id, req.body);
      ok(res, subtask);
    } catch (err) { next(err); }
  },

  async deleteSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      await tasksService.deleteSubtask(req.user!.id, req.params.id);
      ok(res, null);
    } catch (err) { next(err); }
  },
};
