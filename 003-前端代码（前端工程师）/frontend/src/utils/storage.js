/**
 * storage.js
 * --------------------------------------------------------------------------
 * 本地存储工具模块 - 封装 localStorage 操作
 *
 * 提供统一的数据读写接口，处理 JSON 序列化与异常捕获，
 * 业务模块无需关心 localStorage 细节。
 * --------------------------------------------------------------------------
 */

const Storage = {
  /**
   * 读取数据
   * @param {string} key 键名
   * @param {*} fallback 读取失败时的默认值
   */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error(`[Storage] Failed to read key: ${key}`, e);
      return fallback;
    }
  },

  /**
   * 写入数据
   * @param {string} key 键名
   * @param {*} value 要写入的值（自动 JSON 序列化）
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to write key: ${key}`, e);
      return false;
    }
  },

  /**
   * 删除某个键
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to remove key: ${key}`, e);
      return false;
    }
  },

  /**
   * 清空所有 expense_ 前缀的键（用于"清空所有数据"功能）
   */
  clearAllExpenseData() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("expense_")) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      console.error("[Storage] Failed to clear data", e);
      return false;
    }
  },
};