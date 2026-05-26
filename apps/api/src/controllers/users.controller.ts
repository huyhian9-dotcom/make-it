import type { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service.js';
import { ok } from '../utils/response.js';

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getMe(req.user!.id);
      ok(res, user);
    } catch (err) { next(err); }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateMe(req.user!.id, req.body);
      ok(res, user);
    } catch (err) { next(err); }
  },

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updatePreferences(req.user!.id, req.body);
      ok(res, user);
    } catch (err) { next(err); }
  },
};
