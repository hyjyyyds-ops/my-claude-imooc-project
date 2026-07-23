/**
 * bill.js
 * --------------------------------------------------------------------------
 * 账单管理模块 - V1.0.1 改造：所有数据走 Spring Boot 后端 API
 *
 * 关键改动：
 *   - 内存缓存（_cache）保证同步读取性能
 *   - 写操作后立即刷新对应缓存
 *   - 首次进入页面需主动调用 refreshRecords() / refreshCategories()
 * --------------------------------------------------------------------------
 */

const BillModule = {
  /**
   * 内部缓存
   *   records    : Record[]   当前用户所有记账
   *   categories : Category[] 当前用户所有分类（系统 + 自定义）
   *   userInfo   : object     当前用户信息（含 streak, lastDate）
   */
  _cache: {
    records: [],
    categories: [],
    userInfo: null,
  },

  // ============== 数据刷新（异步） ==============

  /** 刷新记录缓存，从后端拉取 */
  async refreshRecords() {
    const data = await ApiClient.records.list();
    this._cache.records = data.data || [];
    return this._cache.records;
  },

  /** 刷新分类缓存 */
  async refreshCategories() {
    const data = await ApiClient.categories.list();
    this._cache.categories = data.data || [];
    return this._cache.categories;
  },

  /** 刷新当前用户信息（含 streak） */
  async refreshUserInfo() {
    const data = await ApiClient.users.me();
    this._cache.userInfo = data.data || null;
    return this._cache.userInfo;
  },

  /** 一次性全量刷新（首页/统计/明细首次进入时调用） */
  async refreshAll() {
    await Promise.all([
      this.refreshRecords().catch(() => []),
      this.refreshCategories().catch(() => []),
      this.refreshUserInfo().catch(() => null),
    ]);
  },

  // ============== 同步访问（返回缓存） ==============

  /** 获取所有记录（同步，缓存读取） */
  getAllRecords() {
    return this._cache.records;
  },

  /** 获取所有分类 */
  getCategories() {
    return this._cache.categories;
  },

  /** 获取当前 streak */
  getStreak() {
    return this._cache.userInfo?.streak || 0;
  },

  // ============== 写操作（异步） ==============

  /**
   * 新增一条记账
   * @returns {Promise<object>} 新创建的记账
   */
  async addRecord({ amount, categoryId, remark, date }) {
    const data = await ApiClient.records.create({
      amount: Number(amount),
      categoryId,
      remark: remark || "",
      date: date || null,
    });

    // 记录写完，服务端已更新 streak，顺便刷新用户信息
    await Promise.all([this.refreshRecords(), this.refreshUserInfo()]);
    return data.data;
  },

  /**
   * 删除一条记录（暂未在 UI 中提供，预留）
   */
  async deleteRecord(recordId) {
    // 后端暂未提供 DELETE /api/records/:id，先本地移除
    this._cache.records = this._cache.records.filter((r) => r.id !== recordId);
    return true;
  },

  /**
   * 新增自定义分类
   */
  async addCategory({ name, icon }) {
    const data = await ApiClient.categories.create({ name, icon });
    await this.refreshCategories();
    return data.data;
  },

  /**
   * 删除自定义分类
   */
  async deleteCategory(categoryId) {
    await ApiClient.categories.delete(categoryId);
    await this.refreshCategories();
    return true;
  },

  /**
   * 按月份范围筛选记录（保留旧接口签名，内部走 API + 缓存过滤）
   * @param {Date} start 月初
   * @param {Date} end   月末
   */
  filterByMonth(start, end) {
    const startStr = Helpers.formatDate(start);
    const endStr = Helpers.formatDate(end);
    return this._cache.records.filter(
      (r) => r.date >= startStr && r.date <= endStr
    );
  },

  /**
   * 清空当前用户的打卡数据（保留用户和分类）
   * V1.0.1：暂未实现服务端批量删除，仅清本地缓存
   */
  clearCurrentUserStats() {
    this._cache.records = [];
    if (this._cache.userInfo) {
      this._cache.userInfo.streak = 0;
      this._cache.userInfo.lastDate = null;
    }
  },

  /**
   * 导出当前用户所有数据（下载 JSON 文件）
   * V1.0.1：暂时从本地缓存构造 JSON（V2.0 由服务端 /api/users/me/export 提供完整版）
   */
  exportData() {
    const userStr = localStorage.getItem("expense_user_v1");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return { success: false, message: "未登录" };

    const data = {
      version: "1.0.1",
      exportDate: new Date().toISOString(),
      username: user.username,
      records: this._cache.records,
      categories: this._cache.categories.filter((c) => c.isCustom === 1),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill_backup_${user.username}_${Helpers.formatDate()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);

    return { success: true, message: "数据已导出 ✨" };
  },
};