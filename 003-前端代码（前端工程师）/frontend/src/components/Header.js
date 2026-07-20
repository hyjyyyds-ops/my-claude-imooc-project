/**
 * Header.js
 * --------------------------------------------------------------------------
 * 顶部导航组件 - 记账/明细/统计/我的 共用
 *
 * 使用方式：
 *   Header.mount(container)            // 挂载到指定容器
 *   Header.updateDate()                // 更新日期显示
 *   Header.updateStreak(days)          // 更新连续打卡天数
 * --------------------------------------------------------------------------
 */

const Header = {
  /**
   * 返回 Header 的 HTML 字符串
   */
  template() {
    return `
      <div class="header-date" id="header-date"></div>
      <div class="header-title">
        <span>每日记账</span>
        <span class="streak-badge" id="streak-badge">🔥 已连续 0 天</span>
      </div>
    `;
  },

  /**
   * 挂载 Header 到指定容器
   * @param {HTMLElement|string} container 容器元素或选择器
   */
  mount(container) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = this.template();
    this.updateDate();
    this.updateStreak(BillModule.getStreak());
  },

  /**
   * 渲染用户头像到 Header 右上角（可选，未上传时隐藏）
   */
  renderUserAvatar() {
    const headerEl = document.querySelector("#app-header");
    if (!headerEl) return;

    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return;
    const avatars = Storage.get(STORAGE_KEYS.AVATARS, {});

    let avatarEl = document.getElementById("header-user-avatar");
    if (!avatars[userId]) {
      if (avatarEl) avatarEl.remove();
      return;
    }

    if (!avatarEl) {
      avatarEl = document.createElement("div");
      avatarEl.id = "header-user-avatar";
      avatarEl.className = "header-user-avatar";
      avatarEl.title = "我的头像";
      headerEl.appendChild(avatarEl);
    }
    avatarEl.style.backgroundImage = `url(${avatars[userId]})`;
  },

  /**
   * 更新日期显示（自动取今天）
   */
  updateDate() {
    const el = document.getElementById("header-date");
    if (!el) return;
    const now = new Date();
    el.textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${Helpers.getChineseWeekday(now)}`;
  },

  /**
   * 更新连续打卡天数
   */
  updateStreak(days) {
    const el = document.getElementById("streak-badge");
    if (!el) return;
    el.textContent = `🔥 已连续 ${days} 天`;
  },
};