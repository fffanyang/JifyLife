import { Router } from 'express';
import authRoutes from './auth.routes.js';
import entryRoutes from './entry.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/entries', entryRoutes);

// 健康检查
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
