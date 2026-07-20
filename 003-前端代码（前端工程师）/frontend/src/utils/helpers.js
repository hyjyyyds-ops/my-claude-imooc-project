/**
 * helpers.js
 * --------------------------------------------------------------------------
 * 通用辅助函数
 *
 * - generateId: 生成唯一 ID
 * - formatDate: 日期格式化（使用本地时间）
 * - getDayEmoji: 根据星期返回小动物 Emoji
 * - escapeHtml: HTML 转义（防止 XSS）
 * --------------------------------------------------------------------------
 */

const Helpers = {
  /**
   * 生成唯一 ID（时间戳 + 随机数）
   */
  generateId() {
    return "id_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
  },

  /**
   * 将 Date 对象格式化为 YYYY-MM-DD（使用本地时间，避免跨时区日期错位）
   */
  formatDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  /**
   * 中文星期显示
   */
  getChineseWeekday(date) {
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return weekdays[date.getDay()];
  },

  /**
   * 根据星期几返回可爱的小动物 Emoji
   * 周日-周六分别对应：🐻🐰🐱🐶🐻🦊🐼
   */
  getDayEmoji(date) {
    const emojis = ["🐻", "🐰", "🐱", "🐶", "🐻", "🦊", "🐼"];
    return emojis[date.getDay()];
  },

  /**
   * 时间格式化为 HH:MM
   */
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * HTML 转义，防止用户输入的字符串被解析为 HTML（XSS 防护）
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },
};