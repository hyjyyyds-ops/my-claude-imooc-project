/**
 * router.js
 * --------------------------------------------------------------------------
 * SPA 路由 - 负责按需加载页面 view.html 并触发 onMount
 *
 * 工作流程：
 *   Router.navigateTo(route)
 *     → 校验登录态
 *     → fetch(Pages[route].view) 异步加载 HTML 片段
 *     → 注入到 <main id="app-main">
 *     → 调用 Pages[route].onMount() 绑定事件
 *     → 显示/隐藏 Header 和 TabBar
 *
 * 已登录页面（record/detail/stats/profile）共用 Header + TabBar；
 * 登录/注册页只显示中间内容。
 * --------------------------------------------------------------------------
 */

const Router = {
  currentPage: null,
  /** 缓存已加载的页面 HTML，避免重复 fetch */
  cache: {},

  /**
   * 切换页面（核心 API）
   * @param {string} route - 路由 key（见 ROUTES）
   */
  async navigateTo(route) {
    // 登录态校验（修复：递归调用必须 await，否则会并发渲染）
    const isAuthRoute = [ROUTES.LOGIN, ROUTES.REGISTER].includes(route);
    const currentUser = UserModule.getCurrent();

    if (!currentUser && !isAuthRoute) {
      return await this.navigateTo(ROUTES.LOGIN);   // 修复 Bug 3：return await
    }
    if (currentUser && isAuthRoute) {
      return await this.navigateTo(ROUTES.RECORD);  // 修复 Bug 3：return await
    }

    // 校验页面是否已注册
    const pageModule = Pages[route];
    if (!pageModule || !pageModule.view) {
      console.error(`[Router] Unknown route: ${route}`);
      return;
    }

    // 加载并渲染
    await this._loadPage(route, pageModule);
  },

  /**
   * 应用启动入口
   */
  async bootstrap() {
    const currentUser = UserModule.getCurrent();
    await this.navigateTo(currentUser ? ROUTES.RECORD : ROUTES.LOGIN);
  },

  /**
   * 私有：加载并注入页面
   */
  async _loadPage(route, pageModule) {
    try {
      // 1. 获取 HTML（优先用缓存）
      let html = this.cache[route];
      if (!html) {
        const res = await fetch(pageModule.view);
        html = await res.text();
        this.cache[route] = html;
      }

      // 2. 注入到主内容区
      const main = document.getElementById("app-main");
      main.innerHTML = html;

      // 3. 触发页面 onMount（绑定事件）
      if (typeof pageModule.onMount === "function") {
        pageModule.onMount();
      }

      // 4. 同步 Tab 高亮 & 显隐
      this._toggleChrome(route);

      // 5. 滚动到顶部
      window.scrollTo(0, 0);

      this.currentPage = route;
    } catch (e) {
      console.error(`[Router] Failed to load page: ${route}`, e);
      UI.toast("页面加载失败 🥺");
    }
  },

  /**
   * 私有：控制 Header / TabBar 显隐
   */
  _toggleChrome(route) {
    const showChrome = [ROUTES.RECORD, ROUTES.DETAIL, ROUTES.STATS, ROUTES.PROFILE].includes(route);

    document.getElementById("app-header").style.display = showChrome ? "block" : "none";
    document.getElementById("app-tabbar").style.display = showChrome ? "flex" : "none";

    if (showChrome) {
      Header.updateDate();
      Header.updateStreak(BillModule.getStreak());
      Header.renderUserAvatar();   // 切换页面时同步头像
      TabBar.setActive(route);
    }
  },
};