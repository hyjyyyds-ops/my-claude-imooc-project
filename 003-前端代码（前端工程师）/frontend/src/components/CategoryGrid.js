/**
 * CategoryGrid.js
 * --------------------------------------------------------------------------
 * 分类网格组件 - 在多个页面复用：
 *   - 记账页：选择记账分类
 *   - 明细页：作为筛选栏（横向 chip 列表）
 *   - 我的页：管理自定义分类
 *
 * 三种模式：
 *   - "select"     ：单选，点击触发 onSelect(cat)
 *   - "filter"     ：筛选器样式，点击触发 onFilter(catId)
 *   - "manage"     ：管理列表，点击 ✕ 删除自定义分类
 *
 * 使用方式：
 *   CategoryGrid.render(container, {
 *     mode: "select",
 *     categories: [...],
 *     selectedId: "cat_dining",
 *     showAddButton: true,
 *     columns: 4,
 *     onSelect: (cat) => { ... },
 *     onAdd: () => { ... },
 *   });
 * --------------------------------------------------------------------------
 */

const CategoryGrid = {
  /**
   * 渲染分类网格
   * @param {HTMLElement|string} container
   * @param {object} options
   */
  render(container, options = {}) {
    const {
      mode = "select",          // "select" | "filter" | "manage"
      categories = BillModule.getCategories(),
      selectedId = null,
      showAddButton = false,
      columns = 4,
      onSelect = () => {},
      onAdd = () => {},
    } = options;

    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;

    el.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    el.innerHTML = "";

    // 分类项
    categories.forEach(cat => {
      const item = this._createItem(cat, mode, selectedId, onSelect);
      el.appendChild(item);
    });

    // "添加"按钮（仅 select 模式且 showAddButton=true）
    if (mode === "select" && showAddButton) {
      const addBtn = document.createElement("div");
      addBtn.className = "category-item add-new";
      addBtn.onclick = onAdd;
      addBtn.innerHTML = `
        <span class="category-icon">➕</span>
        <span class="category-name">添加</span>
      `;
      el.appendChild(addBtn);
    }
  },

  /**
   * 渲染筛选器样式（横向 chip 列表）
   * @param {HTMLElement|string} container
   * @param {object} options
   */
  renderFilter(container, options = {}) {
    const {
      categories = BillModule.getCategories(),
      selectedId = "all",
      onSelect = () => {},
    } = options;

    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = "";

    // "全部" 项
    const allItem = document.createElement("div");
    allItem.className = "filter-chip" + (selectedId === "all" ? " active" : "");
    allItem.textContent = "全部";
    allItem.onclick = () => onSelect("all");
    el.appendChild(allItem);

    categories.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = "filter-chip" + (selectedId === cat.id ? " active" : "");
      chip.textContent = `${cat.icon} ${cat.name}`;
      chip.onclick = () => onSelect(cat.id);
      el.appendChild(chip);
    });
  },

  /** 私有：创建单个分类项（修复：转义用户输入防止 XSS） */
  _createItem(cat, mode, selectedId, onSelect) {
    const item = document.createElement("div");
    item.className = "category-item" + (selectedId === cat.id ? " selected" : "");
    item.onclick = () => onSelect(cat);

    let inner = `
      <span class="category-icon">${Helpers.escapeHtml(cat.icon)}</span>
      <span class="category-name">${Helpers.escapeHtml(cat.name)}</span>
    `;

    // 管理模式下，额外渲染删除按钮（仅自定义分类）
    if (mode === "manage" && cat.isCustom) {
      inner += `<span class="category-delete" data-id="${cat.id}">✕</span>`;
    }

    item.innerHTML = inner;

    // 绑定删除按钮（需要在 innerHTML 之后）
    if (mode === "manage" && cat.isCustom) {
      item.querySelector(".category-delete").onclick = (e) => {
        e.stopPropagation();
        if (confirm(`确定要删除分类 "${cat.name}" 吗？`)) {
          BillModule.deleteCategory(cat.id);
          item.remove();
          UI.toast("分类已删除");
        }
      };
    }

    return item;
  },
};