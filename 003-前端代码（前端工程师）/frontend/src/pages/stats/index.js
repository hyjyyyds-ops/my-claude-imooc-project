/**
 * pages/stats/index.js
 * --------------------------------------------------------------------------
 * 统计页 - 本月/上月支出汇总 + 甜甜圈图 + 排行榜
 * --------------------------------------------------------------------------
 */

Pages = window.Pages || {};

Pages.stats = {
  view: "src/pages/stats/view.html",

  state: {
    period: "current", // "current" | "last"
  },

  onMount() {
    document.querySelectorAll(".stats-period-tab").forEach(tab => {
      tab.onclick = () => this.switchPeriod(tab.dataset.period);
    });
    this.render();
  },

  switchPeriod(period) {
    this.state.period = period;
    document.querySelectorAll(".stats-period-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.period === period);
    });
    this.render();
  },

  render() {
    const now = new Date();
    let startDate, endDate;

    if (this.state.period === "current") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    const records = BillModule.filterByMonth(startDate, endDate);
    const total = records.reduce((sum, r) => sum + r.amount, 0);
    const uniqueDays = new Set(records.map(r => r.date));
    const dayCount = uniqueDays.size || 1;
    const dailyAvg = total / dayCount;

    document.getElementById("stats-total").textContent = `¥ ${total.toFixed(2)}`;
    document.getElementById("stats-detail").textContent =
      `记账 ${dayCount} 天 · 日均 ¥${dailyAvg.toFixed(1)}`;

    // 按分类汇总
    const categoryTotals = {};
    records.forEach(r => {
      categoryTotals[r.categoryId] = (categoryTotals[r.categoryId] || 0) + r.amount;
    });

    this.renderDonutChart(categoryTotals, total, records.length);
    this.renderRankList(categoryTotals, total);
  },

  renderDonutChart(categoryTotals, total, recordCount) {
    const canvas = document.getElementById("donut-canvas");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;
    const innerRadius = 45;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ["#FFB7C5", "#FFD1DC", "#E6E6FA", "#FF8A80", "#A5D6A7", "#87CEEB", "#DDA0DD", "#F0E68C"];

    const sorted = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const categories = BillModule.getCategories();
    const legend = document.getElementById("donut-legend");
    legend.innerHTML = "";

    // 修复 Bug 2：根据当前 period 动态显示"本月/上月"
    const periodLabel = this.state.period === "current" ? "本月" : "上月";

    if (sorted.length === 0) {
      ctx.fillStyle = "#E6E6FA";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8D7B7B";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("暂无数据", centerX, centerY);
      // 修复 Bug 1：EmptyState 由 renderRankList 统一负责，避免重复写入被清空
      return;
    }

    let startAngle = -Math.PI / 2;
    sorted.forEach(([catId, amount], index) => {
      const cat = categories.find(c => c.id === catId) || { name: "其他", icon: "📝" };
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      const sweepAngle = (amount / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sweepAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sweepAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `
        <span class="legend-dot" style="background: ${colors[index % colors.length]}"></span>
        ${Helpers.escapeHtml(cat.icon)} ${Helpers.escapeHtml(cat.name)} ${percentage.toFixed(0)}%
      `;
      legend.appendChild(legendItem);

      startAngle += sweepAngle;
    });

    ctx.fillStyle = "#5D4037";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(periodLabel, centerX, centerY - 8);   // 修复 Bug 2
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#8D7B7B";
    ctx.fillText(`${recordCount} 笔`, centerX, centerY + 10);
  },

  renderRankList(categoryTotals, total) {
    const list = document.getElementById("rank-list");
    list.innerHTML = "";

    // 修复 Bug 1：空状态统一由本函数负责
    if (Object.keys(categoryTotals).length === 0) {
      EmptyState.render("#rank-list", {
        icon: "📊",
        text: this.state.period === "current" ? "本月暂无消费记录" : "上月暂无消费记录",
      });
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    // 修复 Bug 6：扩展调色板到 8 色，避免第 4 项后颜色重复
    const colors = ["#FFB7C5", "#FFD1DC", "#E6E6FA", "#FF8A80", "#A5D6A7", "#87CEEB", "#DDA0DD", "#F0E68C"];
    const categories = BillModule.getCategories();
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    const maxAmount = sorted[0][1];
    sorted.forEach(([catId, amount], index) => {
      const cat = categories.find(c => c.id === catId) || { name: "其他", icon: "📝" };
      const percentage = total > 0 ? (amount / total * 100) : 0;

      const itemEl = document.createElement("div");
      itemEl.className = "rank-item";
      itemEl.innerHTML = `
        <span class="rank-badge">${medals[index] || ""}</span>
        <span class="rank-icon">${Helpers.escapeHtml(cat.icon)}</span>
        <span class="rank-name">${Helpers.escapeHtml(cat.name)}</span>
        <div class="rank-bar">
          <div class="rank-bar-fill"
               style="width: ${(amount / maxAmount * 100)}%; background: ${colors[index % colors.length]}"></div>
        </div>
        <span class="rank-amount">¥${amount.toFixed(0)}</span>
        <span class="rank-percent">${percentage.toFixed(0)}%</span>
      `;
      list.appendChild(itemEl);
    });
  },
};