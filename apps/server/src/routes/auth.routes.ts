import { Router } from 'express';
import { loginSchema, registerSchema } from '@jifylife/shared';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import { success, error } from '../utils/response.js';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const result = await authService.register(req.body.email, req.body.password, req.body.nickname);
    success(res, result, '注册成功', 201);
  } catch (e: any) {
    error(res, e.message);
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    success(res, result, '登录成功');
  } catch (e: any) {
    error(res, e.message, 401);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    success(res, result);
  } catch (e: any) {
    error(res, e.message, 401);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    success(res, user);
  } catch (e: any) {
    error(res, e.message);
  }
});

export default router;
