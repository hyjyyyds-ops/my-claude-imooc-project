/**
 * Modal.js
 * --------------------------------------------------------------------------
 * 底部弹出层组件 - 添加分类等场景使用
 *
 * 使用方式：
 *   Modal.show({
 *     title: "添加新分类 ✨",
 *     content: "<input ... />",     // HTML 字符串
 *     onConfirm: () => { ... },
 *   });
 * --------------------------------------------------------------------------
 */

const Modal = {
  /** 当前是否显示 */
  isOpen: false,

  /**
   * 弹出 Modal
   */
  show({ title = "", content = "", onConfirm = null, onCancel = null } = {}) {
    const overlay = document.getElementById("global-modal");
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <span class="modal-close" data-action="close">×</span>
        </div>
        <div class="modal-body">${content}</div>
        <div class="modal-actions">
          <button class="btn-secondary" data-action="cancel">取消</button>
          <button class="btn-primary"   data-action="confirm">保存</button>
        </div>
      </div>
    `;

    overlay.classList.add("show");
    this.isOpen = true;

    // 关闭按钮（修复：调用 onCancel 保证清理逻辑执行）
    overlay.querySelector('[data-action="close"]').onclick = () => {
      if (onCancel) onCancel();
      this.hide();
    };
    overlay.querySelector('[data-action="cancel"]').onclick = () => {
      if (onCancel) onCancel();
      this.hide();
    };
    overlay.querySelector('[data-action="confirm"]').onclick = () => {
      if (onConfirm) onConfirm();
      // 注：不在这里自动关闭，由 onConfirm 决定
    };

    // 点击遮罩关闭（修复：同样调用 onCancel）
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        if (onCancel) onCancel();
        this.hide();
      }
    };
  },

  /**
   * 关闭 Modal
   */
  hide() {
    const overlay = document.getElementById("global-modal");
    if (!overlay) return;
    overlay.classList.remove("show");
    this.isOpen = false;
  },
};