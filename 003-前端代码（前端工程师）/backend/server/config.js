/**
 * config.js - 统一读取环境变量
 */
import 'dotenv/config';

export const config = {
  port:        Number(process.env.PORT || 3001),
  clientUrl:   process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     Number(process.env.DB_PORT || 3307),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME     || 'expense_tracker',
  },

  jwt: {
    secret:     process.env.JWT_SECRET     || 'dev-only-secret',
    expiresIn:  Number(process.env.JWT_EXPIRES_IN || 60 * 60 * 24 * 7),
  },
};
