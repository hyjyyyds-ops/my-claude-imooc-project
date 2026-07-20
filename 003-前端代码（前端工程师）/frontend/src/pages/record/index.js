/**
 * pages/record/index.js
 * --------------------------------------------------------------------------
 * 记账页（核心入口）
 *
 * 使用组件：
 *   - CategoryGrid  → 分类选择
 *   - NumberPad     → 数字键盘
 *   - Modal         → 添加分类
 *
 * 状态：currentAmount / selectedCategoryId
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.record = {
  view: "src/pages/record/view.html",

  /** 页面状态 */
  state: {
    currentAmount: "0",
    selectedCategoryId: null,
    addCategoryEmoji: "🛍️",
  },

  /**
   * 页面挂载后调用（每次进入页面都会调用）
   */
  onMount() {
    this.refreshCategoryGrid();

    // 渲染数字键盘（mount 内部自动绑定事件；只在 onMount 中调用一次，避免重复绑定）
    NumberPad.mount("#number-keypad", {
      onInput: (v) => this.appendNumber(v),
      onBackspace: () => this.deleteLastChar(),
    });

    // 确认按钮
    document.getElementById("confirm-btn").onclick = () => this.saveRecord();

    // 重置显示
    this.updateAmountDisplay();
    this.updateConfirmButton();
  },

  /**
   * 单独刷新分类网格（不重新挂载数字键盘）
   * 修复 Bug 7：避免每次记账后重复调用 onMount 导致数字键盘事件监听器累积
   */
  refreshCategoryGrid() {
    CategoryGrid.render("#category-grid", {
      mode: "select",
      columns: 4,
      selectedId: this.state.selectedCategoryId,
      showAddButton: true,
      onSelect: (cat) => this.selectCategory(cat.id),
      onAdd: () => this.showAddCategoryModal(),
    });
  },

  selectCategory(id) {
    this.state.selectedCategoryId = id;
    this.refreshCategoryGrid();
    this.updateConfirmButton();
  },

  appendNumber(num) {
    if (num === "." && this.state.currentAmount.includes(".")) return;
    if (this.state.currentAmount === "0" && num !== ".") {
      this.state.currentAmount = num;
    } else if (this.state.currentAmount.includes(".") && this.state.currentAmount.split(".")[1].length >= 2) {
      return;
    } else {
      this.state.currentAmount += num;
    }
    this.updateAmountDisplay();
    this.updateConfirmButton();
  },

  deleteLastChar() {
    this.state.currentAmount = this.state.currentAmount.length > 1
      ? this.state.currentAmount.slice(0, -1)
      : "0";
    this.updateAmountDisplay();
    this.updateConfirmButton();
  },

  updateAmountDisplay() {
    const num = parseFloat(this.state.currentAmount) || 0;
    document.getElementById("amount-display").textContent = num.toFixed(2);
  },

  updateConfirmButton() {
    const btn = document.getElementById("confirm-btn");
    const amount = parseFloat(this.state.currentAmount) || 0;
    btn.disabled = !(amount > 0 && this.state.selectedCategoryId);
  },

  /**
   * 保存记账
   */
  saveRecord() {
    const amount = parseFloat(this.state.currentAmount);
    if (amount <= 0 || !this.state.selectedCategoryId) return;

    BillModule.addRecord({
      amount,
      categoryId: this.state.selectedCategoryId,
      remark: document.getElementById("remark-input").value.trim(),
      date: Helpers.formatDate(),
    });

    UI.spawnParticles("#confirm-btn");
    UI.toast("记账成功 ✨");

    // 重置表单状态（修复：不再调用 onMount，避免数字键盘事件叠加）
    this.state.currentAmount = "0";
    this.state.selectedCategoryId = null;
    document.getElementById("remark-input").value = "";
    this.updateAmountDisplay();
    this.refreshCategoryGrid();   // 只刷新分类网格的选中态
    Header.updateStreak(BillModule.getStreak());
  },

  /* ----------- 添加分类弹窗 ----------- */

  /**
   * 弹出添加分类 Modal
   */
  showAddCategoryModal() {
    const emojiHtml = EMOJI_OPTIONS.map(e =>
      `<button class="emoji-option" data-emoji="${e}">${e}</button>`
    ).join("");

    Modal.show({
      title: "添加新分类 ✨",
      content: `
        <input id="new-category-name" type="text" class="input-field"
               placeholder="分类名称，如：宠物" maxlength="10">
        <div style="margin-top: 16px; text-align: center; font-size: 40px;" id="new-category-preview">${this.state.addCategoryEmoji}</div>
        <div id="emoji-picker" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
          ${emojiHtml}
        </div>
      `,
      onConfirm: () => this.saveNewCategory(),
    });

    // 绑定 Emoji 选择
    document.querySelectorAll("#emoji-picker .emoji-option").forEach(btn => {
      btn.onclick = () => {
        this.state.addCategoryEmoji = btn.dataset.emoji;
        document.getElementById("new-category-preview").textContent = btn.dataset.emoji;
        document.querySelectorAll("#emoji-picker .emoji-option").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });
  },

  /**
   * 保存新分类
   */
  saveNewCategory() {
    const name = document.getElementById("new-category-name").value.trim();
    if (!name) {
      UI.toast("请输入分类名称 🥺");
      return;
    }
    BillModule.addCategory({ name, icon: this.state.addCategoryEmoji });
    Modal.hide();
    this.refreshCategoryGrid();  // 修复：不要重新挂载整个 onMount
    UI.toast("分类添加成功 ✨");
  },
};