/**
 * routes/auth.js - 注册 / 登录路由
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../lib/db.js';
import { hashPassword, verifyPassword, signToken } from '../lib/auth.js';
import { validateRegister, validateLogin } from '../lib/validators.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { username, password, confirmPassword }
 */
router.post('/register', async (req, res) => {
  try {
    const v = validateRegister(req.body);
    if (!v.ok) return res.status(400).json({ success: false, message: v.message });

    const { username, password } = v;

    // 1. 检查用户名是否已存在
    const exists = await query(
      'SELECT id FROM t_user WHERE username = ? LIMIT 1',
      [username]
    );
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: '该用户名已被注册，换一个试试？' });
    }

    // 2. 密码哈希
    const passwordHash = await hashPassword(password);

    // 3. 插入新用户
    const userId = `id_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
    const now = Date.now();
    await query(
      `INSERT INTO t_user (id, username, password_hash, streak, created_at, updated_at)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [userId, username, passwordHash, now, now]
    );

    // 4. 签发 token
    const token = signToken({ id: userId, username });

    return res.status(201).json({
      success: true,
      message: '注册成功 ✨',
      user: { id: userId, username, avatar: null, createdAt: now },
      token,
    });
  } catch (e) {
    console.error('[register]', e);
    return res.status(500).json({ success: false, message: '服务器开小差啦，请稍后再试 🥺' });
  }
});

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
router.post('/login', async (req, res) => {
  try {
    const v = validateLogin(req.body);
    if (!v.ok) return res.status(400).json({ success: false, message: v.message });

    const { username, password } = v;

    // 1. 查找用户
    const rows = await query(
      'SELECT id, username, password_hash, avatar, created_at FROM t_user WHERE username = ? LIMIT 1',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '该用户不存在，先注册一下吧~' });
    }
    const user = rows[0];

    // 2. 校验密码
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: '密码错了，再试一次？ 🥺' });
    }

    // 3. 签发 token
    const token = signToken({ id: user.id, username: user.username });

    return res.json({
      success: true,
      message: '登录成功 ✨',
      user: { id: user.id, username: user.username, avatar: user.avatar, createdAt: user.created_at },
      token,
    });
  } catch (e) {
    console.error('[login]', e);
    return res.status(500).json({ success: false, message: '服务器开小差啦，请稍后再试 🥺' });
  }
});

export default router;
