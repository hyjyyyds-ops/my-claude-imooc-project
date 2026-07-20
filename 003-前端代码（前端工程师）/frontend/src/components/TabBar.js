/**
 * TabBar.js
 * --------------------------------------------------------------------------
 * 底部 Tab 导航组件 - 已登录页面共用
 *
 * 使用方式：
 *   TabBar.mount(container)       // 挂载
 *   TabBar.setActive(route)       // 高亮指定 Tab
 * --------------------------------------------------------------------------
 */

const TabBar = {
  /** Tab 配置（集中维护，便于增删） */
  tabs: [
    { route: ROUTES.RECORD,  icon: "✏️", label: "记账" },
    { route: ROUTES.DETAIL,  icon: "📋", label: "明细" },
    { route: ROUTES.STATS,   icon: "📊", label: "统计" },
    { route: ROUTES.PROFILE, icon: "🐱", label: "我的" },
  ],

  template() {
    return this.tabs.map(t => `
      <div class="tab-item" data-page="${t.route}" onclick="Router.navigateTo('${t.route}')">
        <span class="tab-icon">${t.icon}</span>
        <span class="tab-label">${t.label}</span>
      </div>
    `).join("");
  },

  /**
   * 挂载到容器
   */
  mount(container) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = this.template();
  },

  /**
   * 设置当前激活的 Tab
   */
  setActive(route) {
    document.querySelectorAll(".tab-item").forEach(item => {
      item.classList.toggle("active", item.dataset.page === route);
    });
  },
};