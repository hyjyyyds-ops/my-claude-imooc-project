/**
 * BillList.js
 * --------------------------------------------------------------------------
 * 账单列表组件 - 按日期倒序分组展示消费记录
 *
 * 使用方式：
 *   BillList.render(container, {
 *     records: [...],
 *     onItemClick: (record) => { ... },   // 点击单项回调（如删除）
 *     emptyText: "暂无账单，快去记一笔吧~",
 *   });
 * --------------------------------------------------------------------------
 */

const BillList = {
  render(container, options = {}) {
    const {
      records = [],
      categories = BillModule.getCategories(),
      onItemClick = null,
      emptyText = "暂无账单，快去记一笔吧~",
    } = options;

    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;

    if (records.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🐱</div>
          <div class="empty-state-text">${emptyText}</div>
        </div>
      `;
      return;
    }

    // 按日期分组
    const groups = this._groupByDate(records);
    el.innerHTML = "";

    Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach(date => {
        const groupEl = this._createGroup(groups[date], date, categories, onItemClick);
        el.appendChild(groupEl);
      });
  },

  /** 私有：按日期分组 */
  _groupByDate(records) {
    const groups = {};
    records.forEach(record => {
      (groups[record.date] = groups[record.date] || []).push(record);
    });
    return groups;
  },

  /** 私有：创建单个日期分组 */
  _createGroup(dayRecords, date, categories, onItemClick) {
    const dateObj = new Date(date);
    const dayTotal = dayRecords.reduce((sum, r) => sum + r.amount, 0);

    const groupEl = document.createElement("div");
    groupEl.className = "bill-group";
    groupEl.innerHTML = `
      <div class="bill-group-header">
        <div class="bill-group-date">
          <span class="bill-group-emoji">${Helpers.getDayEmoji(dateObj)}</span>
          <span>${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${Helpers.getChineseWeekday(dateObj)}</span>
        </div>
        <div class="bill-group-amount">-${dayTotal.toFixed(2)}</div>
      </div>
    `;

    dayRecords.forEach(record => {
      const itemEl = this._createItem(record, categories, onItemClick);
      groupEl.appendChild(itemEl);
    });

    return groupEl;
  },

  /** 私有：创建单个账单项（修复：转义用户输入防止 XSS） */
  _createItem(record, categories, onItemClick) {
    const cat = categories.find(c => c.id === record.categoryId) || { name: "未知", icon: "❓" };
    const itemEl = document.createElement("div");
    itemEl.className = "bill-item";
    if (onItemClick) {
      itemEl.onclick = () => onItemClick(record);
      itemEl.style.cursor = "pointer";
    }

    itemEl.innerHTML = `
      <div class="bill-icon">${Helpers.escapeHtml(cat.icon)}</div>
      <div class="bill-info">
        <div class="bill-category">${Helpers.escapeHtml(cat.name)}</div>
        ${record.remark ? `<div class="bill-remark">${Helpers.escapeHtml(record.remark)}</div>` : ""}
      </div>
      <div class="bill-amount">-${record.amount.toFixed(2)}</div>
      <div class="bill-time">${Helpers.formatTime(record.createdAt)}</div>
    `;
    return itemEl;
  },
};