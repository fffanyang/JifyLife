import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync } from 'fs';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// 中间件
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api', routes);

// 生产环境：托管前端静态文件
if (config.nodeEnv === 'production') {
  // 前端构建产物目录（构建时会复制到这里）
  const staticDir = resolve(__dirname, '../public');
  if (existsSync(staticDir)) {
    app.use(express.static(staticDir, { maxAge: '30d' }));
    // SPA fallback：所有非 API 路由都返回 index.html
    app.get('*', (_req, res) => {
      res.sendFile(join(staticDir, 'index.html'));
    });
    console.log(`📦 Serving static files from ${staticDir}`);
  } else {
    console.warn(`⚠️  Static directory not found at ${staticDir}, skipping frontend hosting`);
  }
}

// 错误处理
app.use(errorHandler);

// 启动服务（生产环境绑定 0.0.0.0）
const host = config.nodeEnv === 'production' ? '0.0.0.0' : 'localhost';
app.listen(config.port, host, () => {
  console.log(`🦀 JifyLife server running at http://${host}:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Health check: http://${host}:${config.port}/api/health`);
  if (config.nodeEnv === 'production') {
    console.log(`   Frontend: http://${host}:${config.port}`);
  }
});
