import type { Response } from 'express';

export function ok<T>(res: Response, data: T, message?: string, status = 200): void {
  res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function created<T>(res: Response, data: T, message?: string): void {
  ok(res, data, message, 201);
}
