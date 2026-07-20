/**
 * bill.js
 * --------------------------------------------------------------------------
 * 账单管理模块 - 消费记录与分类的增删改查
 *
 * 所有数据查询都基于当前登录用户，实现数据隔离。
 * --------------------------------------------------------------------------
 */

const BillModule = {
  /**
   * 获取当前用户的所有记录
   */
  getAllRecords() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return [];
    return Storage.get(STORAGE_KEYS.RECORDS, []).filter(r => r.userId === userId);
  },

  /**
   * 获取当前用户的分类（含系统预设 + 自定义）
   */
  getCategories() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return [...DEFAULT_CATEGORIES];

    const customCategories = Storage.get(STORAGE_KEYS.CATEGORIES, [])
      .filter(c => c.userId === userId);

    return [...DEFAULT_CATEGORIES, ...customCategories];
  },

  /**
   * 新增一条消费记录
   */
  addRecord({ amount, categoryId, remark, date }) {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) throw new Error("未登录");

    // 修复：校验金额，防止 NaN 损坏数据
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      throw new Error("金额必须为正数");
    }

    const allRecords = Storage.get(STORAGE_KEYS.RECORDS, []);
    const now = Date.now();

    const record = {
      id: Helpers.generateId(),
      userId,
      amount: amt,
      type: "expense",
      categoryId,
      remark: (remark || "").trim(),
      date: date || Helpers.formatDate(new Date(now)),
      createdAt: now,
      updatedAt: now,
    };

    allRecords.unshift(record);
    Storage.set(STORAGE_KEYS.RECORDS, allRecords);

    // 修复：记账后立即更新连续打卡天数
    this.updateStreak();

    return record;
  },

  /**
   * 删除记录（修复：校验 userId，防止跨用户删除）
   */
  deleteRecord(recordId) {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return false;
    const all = Storage.get(STORAGE_KEYS.RECORDS, []);
    const filtered = all.filter(r => !(r.id === recordId && r.userId === userId));
    Storage.set(STORAGE_KEYS.RECORDS, filtered);
    return filtered.length < all.length;
  },

  /**
   * 新增自定义分类
   */
  addCategory({ name, icon }) {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) throw new Error("未登录");

    const all = Storage.get(STORAGE_KEYS.CATEGORIES, []);
    const category = {
      id: "cat_custom_" + Date.now(),
      userId,
      name: name.trim(),
      icon,
      type: "expense",
      isCustom: true,
      createdAt: Date.now(),
    };

    all.push(category);
    Storage.set(STORAGE_KEYS.CATEGORIES, all);
    return category;
  },

  /**
   * 删除自定义分类（系统预设不可删；修复：校验 userId）
   */
  deleteCategory(categoryId) {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return false;
    const all = Storage.get(STORAGE_KEYS.CATEGORIES, []);
    const filtered = all.filter(c => !(c.id === categoryId && c.userId === userId));
    Storage.set(STORAGE_KEYS.CATEGORIES, filtered);
    return filtered.length < all.length;
  },

  /**
   * 更新连续打卡天数
   * 规则：如果今天已记过账则不重复 +1；如果是连续日期则 +1，否则重置为 1
   *
   * 数据隔离：每个用户的 streak/lastDate 独立存储
   * 存储结构：{ [userId]: { streak: number, lastDate: "YYYY-MM-DD" } }
   */
  updateStreak() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return 0;

    const today = Helpers.formatDate();
    const statsMap = Storage.get(STORAGE_KEYS.STREAK_MAP, {});
    const userStats = statsMap[userId] || { streak: 0, lastDate: null };

    if (userStats.lastDate === today) return userStats.streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = Helpers.formatDate(yesterday);

    const newStreak = (userStats.lastDate === yesterdayStr) ? userStats.streak + 1 : 1;
    statsMap[userId] = { streak: newStreak, lastDate: today };
    Storage.set(STORAGE_KEYS.STREAK_MAP, statsMap);
    return newStreak;
  },

  getStreak() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return 0;
    const statsMap = Storage.get(STORAGE_KEYS.STREAK_MAP, {});
    return (statsMap[userId]?.streak) || 0;
  },

  /**
   * 清除当前用户的所有打卡数据（用于清空数据功能）
   */
  clearCurrentUserStats() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return;
    const statsMap = Storage.get(STORAGE_KEYS.STREAK_MAP, {});
    delete statsMap[userId];
    Storage.set(STORAGE_KEYS.STREAK_MAP, statsMap);
  },

  /**
   * 按月份范围筛选记录
   * @param {Date} start 月初
   * @param {Date} end 月末
   */
  filterByMonth(start, end) {
    const startStr = Helpers.formatDate(start);
    const endStr = Helpers.formatDate(end);
    return this.getAllRecords().filter(r => r.date >= startStr && r.date <= endStr);
  },

  /**
   * 导出当前用户所有数据为 JSON
   * @returns {{success: boolean, message: string}}
   */
  exportData() {
    const user = UserModule.getCurrent();
    if (!user) return { success: false, message: "未登录" };

    const data = {
      version: "1.0.1",
      exportDate: new Date().toISOString(),
      username: user.username,
      records: this.getAllRecords(),
      categories: Storage.get(STORAGE_KEYS.CATEGORIES, []).filter(c => c.userId === user.id),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill_backup_${user.username}_${Helpers.formatDate()}.json`;

    // 修复：必须挂载到 DOM 才能在 Firefox 中触发下载
    document.body.appendChild(a);
    a.click();
    a.remove();

    // 修复：延迟释放 URL，避免某些浏览器下载未开始就失效
    setTimeout(() => URL.revokeObjectURL(url), 0);

    return { success: true, message: "数据已导出 ✨" };
  },
};