import type { Request, Response, NextFunction } from 'express';
import { labelsService } from '../services/labels.service.js';
import { ok, created } from '../utils/response.js';

export const labelsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await labelsService.list(req.user!.id);
      ok(res, labels);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelsService.create(req.user!.id, req.body);
      created(res, label);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelsService.update(req.user!.id, req.params.id, req.body);
      ok(res, label);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await labelsService.delete(req.user!.id, req.params.id);
      ok(res, null);
    } catch (err) { next(err); }
  },
};
