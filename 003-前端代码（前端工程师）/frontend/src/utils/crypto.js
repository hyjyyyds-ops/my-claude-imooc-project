/**
 * crypto.js
 * --------------------------------------------------------------------------
 * 加密工具 - 用于密码哈希
 *
 * 使用 Web Crypto API 计算 SHA-256。
 * 注意：crypto.subtle 仅在安全上下文（HTTPS、localhost、127.0.0.1）
 * 可用，通过局域网 IP 或 file:// 访问时不可用。
 * --------------------------------------------------------------------------
 */

const Crypto = {
  /**
   * 检测 Web Crypto API 是否可用
   */
  isAvailable() {
    return typeof crypto !== "undefined" && crypto.subtle;
  },

  /**
   * 计算 SHA-256 哈希（返回 hex）
   * @param {string} text 明文
   * @returns {Promise<string>} 64 位 hex 字符串
   * @throws {Error} 当 Web Crypto API 不可用时
   */
  async sha256(text) {
    if (!this.isAvailable()) {
      throw new Error(
        "Web Crypto API 不可用。请通过 HTTPS 或 localhost 访问，或使用现代浏览器。"
      );
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },
};