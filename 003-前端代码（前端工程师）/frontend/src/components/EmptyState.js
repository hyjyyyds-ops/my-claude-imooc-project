/**
 * EmptyState.js
 * --------------------------------------------------------------------------
 * 空状态组件 - 数据为空时显示可爱插画 + 文案
 *
 * 使用方式：
 *   EmptyState.render(container, {
 *     icon: "🐱",                  // Emoji 插画
 *     text: "暂无账单，快去记一笔吧~",
 *   });
 * --------------------------------------------------------------------------
 */

const EmptyState = {
  render(container, options = {}) {
    const { icon = "🐱", text = "暂无数据" } = options;

    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;

    // 修复 Bug 4：转义 icon 和 text，防止未来动态数据被 XSS
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Helpers.escapeHtml(icon)}</div>
        <div class="empty-state-text">${Helpers.escapeHtml(text)}</div>
      </div>
    `;
  },
};