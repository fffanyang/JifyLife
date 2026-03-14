import { Router } from 'express';
import { createEntrySchema, paginationSchema } from '@jifylife/shared';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import * as entryService from '../services/entry.service.js';
import { success, error } from '../utils/response.js';

const router = Router();

// 所有条目路由都需要认证
router.use(authMiddleware);

// 创建条目（核心接口——统一输入）
router.post('/', validate(createEntrySchema), async (req, res) => {
  try {
    const entry = await entryService.createEntry(req.user!.userId, req.body.content, req.body.type);
    success(res, entry, '创建成功', 201);
  } catch (e: any) {
    error(res, e.message);
  }
});

// 获取条目列表（时间线）
router.get('/', validate(paginationSchema, 'query'), async (req, res) => {
  try {
    const { page, pageSize } = req.query as any;
    const type = req.query.type as string | undefined;
    const result = await entryService.getEntries(req.user!.userId, page, pageSize, type);
    success(res, result);
  } catch (e: any) {
    error(res, e.message);
  }
});

// 获取单个条目
router.get('/:id', async (req, res) => {
  try {
    const entry = await entryService.getEntryById(req.user!.userId, req.params.id);
    success(res, entry);
  } catch (e: any) {
    error(res, e.message, 404);
  }
});

// 更新条目
router.patch('/:id', async (req, res) => {
  try {
    const entry = await entryService.updateEntry(req.user!.userId, req.params.id, req.body);
    success(res, entry);
  } catch (e: any) {
    error(res, e.message);
  }
});

// 删除条目
router.delete('/:id', async (req, res) => {
  try {
    await entryService.deleteEntry(req.user!.userId, req.params.id);
    success(res, null, '删除成功');
  } catch (e: any) {
    error(res, e.message);
  }
});

export default router;
