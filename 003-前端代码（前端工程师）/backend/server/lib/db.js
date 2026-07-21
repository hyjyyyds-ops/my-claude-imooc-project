/**
 * db.js - MySQL 连接池（单例）
 */
import mysql from 'mysql2/promise';
import { config } from '../config.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:            config.db.host,
      port:            config.db.port,
      user:            config.db.user,
      password:        config.db.password,
      database:        config.db.database,
      charset:         'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit:      0,
      decimalNumbers:  true,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function ping() {
  const conn = await getPool().getConnection();
  try { await conn.ping(); return true; } finally { conn.release(); }
}
