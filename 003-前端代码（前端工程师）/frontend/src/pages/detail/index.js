/**
 * pages/detail/index.js
 * --------------------------------------------------------------------------
 * 明细页 - 消费流水展示（只读，不可点击删除）
 *
 * 使用组件：
 *   - CategoryGrid (filter 模式)  → 横向筛选栏
 *   - BillList                     → 列表渲染
 *
 * 删除功能：V1.0.1 暂不提供（V2.0 将通过左滑/编辑页提供）
 * 原因：点击整行就触发删除是非常反人类的设计，容易误删
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.detail = {
  view: "src/pages/detail/view.html",

  state: {
    selectedFilter: "all",
  },

  onMount() {
    this.renderFilterBar();
    this.renderBillList();
  },

  renderFilterBar() {
    CategoryGrid.renderFilter("#filter-bar", {
      selectedId: this.state.selectedFilter,
      onSelect: (id) => this.selectFilter(id),
    });
  },

  selectFilter(id) {
    this.state.selectedFilter = id;
    this.renderFilterBar();
    this.renderBillList();
  },

  renderBillList() {
    let records = BillModule.getAllRecords();
    if (this.state.selectedFilter !== "all") {
      records = records.filter(r => r.categoryId === this.state.selectedFilter);
    }

    // 不再绑定 onItemClick：明细列表只读展示
    BillList.render("#bill-list", {
      records,
      emptyText: "暂无账单，快去记一笔吧~",
    });
  },
};