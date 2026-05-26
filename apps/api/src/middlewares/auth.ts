import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError('UNAUTHORIZED', 'Missing or invalid Authorization header'));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 'Invalid or expired token'));
  }
}
