import type { Response } from 'express';
import type { ApiResponse } from '@jifylife/shared';

export function success<T>(res: Response, data: T, message = 'ok', code = 200) {
  const body: ApiResponse<T> = { code, data, message };
  return res.status(code).json(body);
}

export function error(res: Response, message: string, code = 400) {
  const body: ApiResponse<null> = { code, data: null, message };
  return res.status(code).json(body);
}
