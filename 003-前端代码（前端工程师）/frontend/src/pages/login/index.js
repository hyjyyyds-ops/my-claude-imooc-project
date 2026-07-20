/**
 * pages/login/index.js
 * --------------------------------------------------------------------------
 * 登录页 - 渲染与事件处理
 *
 * 使用组件：Modal（无）
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.login = {
  /** 页面模板路径（由路由器读取） */
  view: "src/pages/login/view.html",

  /**
   * 页面挂载完成后调用：绑定事件、聚焦输入框
   */
  onMount() {
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-username")?.focus();

    // 表单提交
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // 跳转注册
    document.querySelector('[data-nav="register"]').onclick = () => {
      Router.navigateTo(ROUTES.REGISTER);
    };
  },

  /**
   * 处理登录提交
   */
  async handleSubmit() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const result = await UserModule.login(username, password);
    if (!result.success) {
      UI.toast(result.message);
      return;
    }

    UI.toast(`欢迎回来，${result.user.username} ✨`);
    setTimeout(() => Router.navigateTo(ROUTES.RECORD), 800);
  },
};