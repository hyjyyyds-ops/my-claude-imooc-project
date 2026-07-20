/**
 * pages/profile/index.js
 * --------------------------------------------------------------------------
 * 个人中心页 - 用户信息、头像上传、自定义分类管理、数据导出、退出登录
 *
 * 使用组件：CategoryGrid (manage 模式)
 *
 * 头像存储方案：
 *   - 用 <input type="file" accept="image/*"> 打开本地文件夹
 *   - 用 FileReader 转成 Base64 DataURL
 *   - 存入 localStorage（按 userId 隔离）
 *   - 不上传服务器，纯前端处理
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.profile = {
  view: "src/pages/profile/view.html",

  onMount() {
    this.renderUserInfo();
    this.renderAvatar();
    this.renderCustomCategories();
    this.bindActions();
    this.bindAvatarUpload();
  },

  renderUserInfo() {
    const user = UserModule.getCurrent();
    if (!user) return;
    document.getElementById("profile-username").textContent = `欢迎，${user.username} 🐱`;
  },

  /**
   * 渲染头像（优先读 userId 对应的头像，无则用默认 Emoji）
   */
  renderAvatar() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return;
    const avatars = Storage.get(STORAGE_KEYS.AVATARS, {});
    const avatarEl = document.getElementById("profile-avatar");

    if (avatars[userId]) {
      // 用背景图方式显示，避免 innerHTML 注入风险
      avatarEl.style.backgroundImage = `url(${avatars[userId]})`;
      avatarEl.style.backgroundSize = "cover";
      avatarEl.style.backgroundPosition = "center";
      // 隐藏默认 Emoji
      const emoji = avatarEl.querySelector("#profile-avatar-emoji");
      if (emoji) emoji.style.display = "none";
    }
  },

  /**
   * 绑定头像点击 → 触发文件选择
   */
  bindAvatarUpload() {
    const avatarEl = document.getElementById("profile-avatar");
    const inputEl = document.getElementById("avatar-input");

    if (!avatarEl || !inputEl) return;

    // 点击头像打开文件选择
    avatarEl.onclick = () => inputEl.click();

    // 文件选择完成
    inputEl.onchange = (e) => this.handleAvatarSelected(e);
  },

  /**
   * 处理用户选中的图片：读取为 Base64，存到 localStorage
   */
  handleAvatarSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // 校验文件类型（防止非图片）
    if (!file.type.startsWith("image/")) {
      UI.toast("请选择图片文件哦 🥺");
      event.target.value = ""; // 清空选择，允许重新选
      return;
    }

    // 限制大小（防止 localStorage 撑爆）：2MB 以内
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      UI.toast("图片太大了，请选择 2MB 以内的图片 🥺");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
      if (!userId) return;

      const avatars = Storage.get(STORAGE_KEYS.AVATARS, {});
      avatars[userId] = dataUrl;
      Storage.set(STORAGE_KEYS.AVATARS, avatars);

      // 立即刷新头像显示
      this.renderAvatar();
      UI.toast("头像已更新 ✨");
    };
    reader.onerror = () => UI.toast("图片读取失败 🥺");
    reader.readAsDataURL(file);

    // 清空 input.value 允许重复选择同一文件
    event.target.value = "";
  },

  renderCustomCategories() {
    const userId = Storage.get(STORAGE_KEYS.CURRENT_USER);
    const customCategories = Storage.get(STORAGE_KEYS.CATEGORIES, [])
      .filter(c => c.userId === userId);

    if (customCategories.length === 0) {
      EmptyState.render("#profile-categories", {
        icon: "📝",
        text: "还没有自定义分类~",
      });
      return;
    }

    CategoryGrid.render("#profile-categories", {
      mode: "manage",
      columns: 3,
      categories: customCategories,
      onSelect: () => {}, // 管理模式下点击不响应
    });
  },

  bindActions() {
    document.querySelector('[data-action="export"]').onclick = () => this.exportData();
    document.querySelector('[data-action="clear"]').onclick = () => this.clearAllData();
    document.querySelector('[data-action="logout"]').onclick = () => this.logout();
  },

  exportData() {
    const result = BillModule.exportData();
    UI.toast(result.success ? result.message : (result.message || "导出失败 🥺"));
  },

  clearAllData() {
    if (!confirm("清除后数据无法找回，建议先导出备份哦 🥺\n\n确定要继续吗？")) return;
    Storage.set(STORAGE_KEYS.RECORDS, []);
    Storage.set(STORAGE_KEYS.CATEGORIES, []);
    BillModule.clearCurrentUserStats();
    UI.toast("数据已清空 ✨");
    Router.navigateTo(ROUTES.RECORD);
  },

  logout() {
    if (!confirm("确定要退出登录吗？")) return;
    UserModule.logout();
    UI.toast("已退出登录");
    Router.navigateTo(ROUTES.LOGIN);
  },
};