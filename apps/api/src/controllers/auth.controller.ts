import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ok, created } from '../utils/response.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      created(res, result);
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      ok(res, result);
    } catch (err) { next(err); }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.id);
      ok(res, user);
    } catch (err) { next(err); }
  },
};
