/**
 * server/index.js - Express 入口
 *
 * 职责：
 *   - 提供 /api/* 业务接口（登录/注册等）
 *   - 生产环境下托管 Vite 构建产物（dist/）
 *   - 开发环境下不托管（由 Vite dev server 代理 /api）
 */
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import { ping } from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ---------- 基础中间件 ----------
app.use(cors({
  // 开发环境允许常见的本地来源：localhost / 127.0.0.1 任意端口、file://
  origin: (origin, callback) => {
    // 允许的来源：file:// 同源 / 任意 localhost 端口 / 配置的 clientUrl
    const allowed = !origin ||
                    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
                    origin === config.clientUrl;
    if (allowed) {
      // 必须显式传 origin 字符串，否则 CORS 中间件可能回退到 clientUrl
      callback(null, origin || config.clientUrl);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ---------- 业务路由 ----------
app.use('/api/auth', authRouter);

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await ping();
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});

// ---------- 静态资源（生产环境） ----------
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ---------- 全局错误处理 ----------
app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(config.port, () => {
  console.log(`🚀 Express server running at http://localhost:${config.port}`);
  console.log(`   API base:  http://localhost:${config.port}/api`);
});
