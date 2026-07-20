/**
 * ui.js
 * --------------------------------------------------------------------------
 * 通用 UI 反馈组件 - Toast、粒子动画、底部弹层
 *
 * 这些组件跨多个页面复用，因此提取为独立模块。
 * --------------------------------------------------------------------------
 */

const UI = {
  /**
   * 显示 Toast 提示（顶部自动消失）
   * @param {string} message 提示内容
   * @param {number} duration 显示时长（毫秒），默认 2000
   */
  toast(message, duration = 2000) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), duration);
  },

  /**
   * 飘出粒子动画（用于记账成功反馈）
   * @param {string} fromSelector 起始位置元素选择器（默认顶部居中）
   */
  spawnParticles(fromSelector = null) {
    const container = document.getElementById("particles-container");
    if (!container) return;

    const emojis = ["✨", "💕", "🌸", "💗", "⭐"];
    const count = 8 + Math.floor(Math.random() * 5);

    // 修复：使用 nullish 合并防止选择器找不到时 NaN
    const fallbackX = window.innerWidth * 0.5;
    let startX;
    if (fromSelector) {
      const el = document.querySelector(fromSelector);
      startX = el ? el.getBoundingClientRect().left + 40 : fallbackX;
    } else {
      startX = fallbackX;
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = (startX + (Math.random() - 0.5) * 80) + "px";
        particle.style.top = "120px";
        particle.style.fontSize = (14 + Math.random() * 10) + "px";
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
      }, i * 50);
    }
  },

  /**
   * 显示/隐藏底部弹层（基于 ID 操作 #global-modal 已迁移到 Modal.js）
   * 保留以兼容老调用，但推荐使用 Modal.show() / Modal.hide()
   */
  showModal(id) {
    document.getElementById(id)?.classList.add("show");
  },

  hideModal(id) {
    document.getElementById(id)?.classList.remove("show");
  },
};