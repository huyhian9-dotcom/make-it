import type { Request, Response, NextFunction } from 'express';
import { routineBlocksService } from '../services/routineBlocks.service.js';
import { ok, created } from '../utils/response.js';

export const routineBlocksController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const blocks = await routineBlocksService.list(req.user!.id);
      ok(res, blocks);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const block = await routineBlocksService.create(req.user!.id, req.body);
      created(res, block);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const block = await routineBlocksService.update(req.user!.id, req.params.id, req.body);
      ok(res, block);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await routineBlocksService.delete(req.user!.id, req.params.id);
      ok(res, null);
    } catch (err) { next(err); }
  },
};
