import type { Request, Response, NextFunction } from 'express';
import { groupsService } from '../services/groups.service.js';
import { ok, created } from '../utils/response.js';

export const groupsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupsService.list(req.user!.id);
      ok(res, groups);
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.get(req.user!.id, req.params.id);
      ok(res, group);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.create(req.user!.id, req.body);
      created(res, group);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.update(req.user!.id, req.params.id, req.body);
      ok(res, group);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.delete(req.user!.id, req.params.id);
      ok(res, null);
    } catch (err) { next(err); }
  },

  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await groupsService.listTasks(req.user!.id, req.params.id);
      ok(res, tasks);
    } catch (err) { next(err); }
  },

  async createInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const invite = await groupsService.createInvite(req.user!.id, req.params.id, req.body);
      created(res, invite);
    } catch (err) { next(err); }
  },
};
