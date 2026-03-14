import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);

  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 400,
      data: null,
      message: err.errors.map((e) => e.message).join('; '),
    });
  }

  return res.status(500).json({
    code: 500,
    data: null,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
  });
}
