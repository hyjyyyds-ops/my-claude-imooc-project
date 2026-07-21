/**
 * user.js
 * --------------------------------------------------------------------------
 * 用户管理模块 - 注册、登录、会话
 *
 * V1.0.1 改造点：
 *   - register / login 改用后端 API（Express + MySQL）
 *   - 密码不再在浏览器侧 SHA-256 哈希，直接通过 HTTPS 传给后端
 *   - 成功后由后端签发 JWT，前端缓存 token 和 user 快照
 *
 * 兼容说明：
 *   - 仍保留 expense_current_user_v1（用户 ID）和 expense_user_v1（用户快照）
 *   - 旧的 expense_users_v1 多人本地存储不再使用（数据迁移由后端承担）
 * --------------------------------------------------------------------------
 */

const UserModule = {
  /**
   * 注册新用户（调用后端 API）
   * @param {string} username
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  async register(username, password, confirmPassword) {
    const u = (username || "").trim();

    // 客户端基础校验（与后端校验规则一致，提前给出友好提示）
    if (!u) return { success: false, message: "请输入用户名 🥺" };
    if (u.length < 3) return { success: false, message: "用户名至少 3 位哦~" };
    if (u.length > 20) return { success: false, message: "用户名最多 20 位~" };
    if (!password) return { success: false, message: "请输入密码 🔒" };
    if (password.length < 6) return { success: false, message: "密码至少 6 位~" };
    if (password.length > 20) return { success: false, message: "密码最多 20 位~" };
    if (!confirmPassword) return { success: false, message: "请再输入一次密码 🔐" };
    if (password !== confirmPassword) return { success: false, message: "两次密码不一样，再试试？" };

    try {
      const data = await ApiClient.auth.register({
        username: u,
        password,
        confirmPassword,
      });

      // 缓存会话信息
      this._saveSession(data.user, data.token);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, message: e.message || "注册失败，请稍后再试 🥺" };
    }
  },

  /**
   * 用户登录（调用后端 API）
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  async login(username, password) {
    const u = (username || "").trim();

    if (!u) return { success: false, message: "请输入用户名 🥺" };
    if (!password) return { success: false, message: "请输入密码 🔒" };

    try {
      const data = await ApiClient.auth.login({ username: u, password });

      this._saveSession(data.user, data.token);
      return { success: true, user: data.user };
    } catch (e) {
      // 后端返回的 message 已经是 PRD 文案，直接透传
      return { success: false, message: e.message || "登录失败 🥺" };
    }
  },

  /**
   * 获取当前登录用户（从本地缓存）
   * 注意：这是会话级缓存，刷新页面仍有效，但调用其他接口时会以 token 为准
   */
  getCurrent() {
    return Storage.get("expense_user_v1", null);
  },

  /**
   * 退出登录（仅清除本地会话，不通知后端）
   * V1.0.1 后端暂无 token 黑名单，简单清缓存即可
   */
  logout() {
    Storage.remove("expense_current_user_v1");
    Storage.remove("expense_user_v1");
    Storage.remove("expense_token_v1");
  },

  /**
   * 私有：保存登录会话
   * @param {object} user
   * @param {string} token
   */
  _saveSession(user, token) {
    if (user && user.id) {
      Storage.set("expense_current_user_v1", user.id);
    }
    if (user) {
      Storage.set("expense_user_v1", user);
    }
    if (token) {
      Storage.set("expense_token_v1", token);
    }
  },

  /**
   * 私有：判断是否已登录（有 token 即视为已登录）
   */
  isLoggedIn() {
    return !!Storage.get("expense_token_v1");
  },
};
