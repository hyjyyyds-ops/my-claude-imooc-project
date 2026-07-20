/**
 * pages/register/index.js
 * --------------------------------------------------------------------------
 * 注册页 - 渲染与事件处理
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.register = {
  view: "src/pages/register/view.html",

  onMount() {
    document.getElementById("register-username").value = "";
    document.getElementById("register-password").value = "";
    document.getElementById("register-confirm").value = "";
    document.getElementById("register-username")?.focus();

    document.getElementById("register-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    document.querySelector('[data-nav="login"]').onclick = () => {
      Router.navigateTo(ROUTES.LOGIN);
    };
  },

  async handleSubmit() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirm  = document.getElementById("register-confirm").value;

    const result = await UserModule.register(username, password, confirm);
    if (!result.success) {
      UI.toast(result.message);
      return;
    }

    UI.spawnParticles();
    UI.toast("注册成功 ✨");
    setTimeout(() => Router.navigateTo(ROUTES.RECORD), 1200);
  },
};