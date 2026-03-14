import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { error } from '../utils/response.js';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return error(res, result.error.errors.map((e) => e.message).join('; '), 400);
    }
    req[source] = result.data;
    next();
  };
}
