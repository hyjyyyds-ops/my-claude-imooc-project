/**
 * user.js
 * --------------------------------------------------------------------------
 * 用户管理模块 - 注册、登录、会话
 *
 * 数据隔离逻辑：
 *   - 所有用户存储在 STORAGE_KEYS.USERS（数组）
 *   - 当前登录用户 ID 存储在 STORAGE_KEYS.CURRENT_USER
 *   - 每条 Record 和自定义 Category 都通过 userId 关联
 * --------------------------------------------------------------------------
 */

const UserModule = {
  /**
   * 注册新用户
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  async register(username, password, confirmPassword) {
    const u = (username || "").trim();

    if (!u) return { success: false, message: "请输入用户名 🥺" };
    if (u.length < VALIDATION.USERNAME_MIN) return { success: false, message: "用户名至少 3 位哦~" };
    if (u.length > VALIDATION.USERNAME_MAX) return { success: false, message: "用户名最多 20 位~" };

    if (!password) return { success: false, message: "请输入密码 🔒" };
    if (password.length < VALIDATION.PASSWORD_MIN) return { success: false, message: "密码至少 6 位~" };
    if (password.length > VALIDATION.PASSWORD_MAX) return { success: false, message: "密码最多 20 位~" };

    if (!confirmPassword) return { success: false, message: "请再输入一次密码 🔐" };
    if (password !== confirmPassword) return { success: false, message: "两次密码不一样，再试试？" };

    const users = Storage.get(STORAGE_KEYS.USERS, []);
    if (users.some(user => user.username === u)) {
      return { success: false, message: "该用户名已被注册，换一个试试？" };
    }

    let passwordHash;
    try {
      passwordHash = await Crypto.sha256(password);
    } catch (e) {
      return { success: false, message: e.message || "密码加密失败" };
    }

    const newUser = {
      id: Helpers.generateId(),
      username: u,
      passwordHash,
      createdAt: Date.now(),
    };

    users.push(newUser);
    Storage.set(STORAGE_KEYS.USERS, users);
    Storage.set(STORAGE_KEYS.CURRENT_USER, newUser.id);

    return { success: true, user: newUser };
  },

  /**
   * 用户登录
   */
  async login(username, password) {
    const u = (username || "").trim();
    if (!u) return { success: false, message: "请输入用户名 🥺" };
    if (!password) return { success: false, message: "请输入密码 🔒" };

    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const user = users.find(item => item.username === u);

    if (!user) return { success: false, message: "该用户不存在，先注册一下吧~" };

    let hash;
    try {
      hash = await Crypto.sha256(password);
    } catch (e) {
      return { success: false, message: e.message || "密码加密失败" };
    }

    if (hash !== user.passwordHash) {
      return { success: false, message: "密码错了，再试一次？ 🥺" };
    }

    Storage.set(STORAGE_KEYS.CURRENT_USER, user.id);
    return { success: true, user };
  },

  /**
   * 获取当前登录用户
   */
  getCurrent() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    return users.find(u => u.id === userId) || null;
  },

  /**
   * 退出登录
   */
  logout() {
    Storage.remove(STORAGE_KEYS.CURRENT_USER);
  },
};