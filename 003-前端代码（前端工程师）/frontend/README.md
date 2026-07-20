# 每日消费记录助手 - Frontend (V1.0.1)

> 粉嫩可爱风格的 Web 端记账应用 · 基于 Stitch "Healing Petals" 设计系统

## ✨ 项目简介

这是一个 **纯前端、无构建工具** 的记账 Web 应用。打开 `index.html` 即可在浏览器中运行，无需任何后端服务。

### 功能特性

| 模块 | 功能 |
| :--- | :--- |
| 🔐 **用户模块** | 注册（用户名+密码 SHA-256 哈希）、登录、会话管理、退出登录 |
| ✏️ **记账模块** | 数字键盘、自定义分类选择、备注、记账成功粒子动画 |
| 📋 **明细模块** | 按日期倒序展示、横向分类筛选、点击删除（带二次确认） |
| 📊 **统计模块** | 本月/上月切换、甜甜圈图、支出排行榜 |
| 🐱 **个人中心** | 用户信息、自定义分类管理、数据导出、清空数据 |

---

## 📁 项目结构

```
frontend/
├── index.html                  # 应用入口（只包含全局挂载点 + 脚本加载）
├── tailwind.config.js          # Tailwind 设计 tokens 配置（可选）
│
├── src/
│   ├── styles/
│   │   └── main.css            # 全局样式
│   │
│   ├── components/             # 🧩 可复用 UI 组件（跨页面共用）
│   │   ├── Header.js           # 顶部导航
│   │   ├── TabBar.js           # 底部 Tab 栏
│   │   ├── CategoryGrid.js     # 分类网格（select/filter/manage 三种模式）
│   │   ├── BillList.js         # 账单列表（按日期分组）
│   │   ├── NumberPad.js        # 数字键盘
│   │   ├── Modal.js            # 底部弹出层
│   │   └── EmptyState.js       # 空状态
│   │
│   ├── pages/                  # 📄 6 个独立页面（每个页面一个目录）
│   │   ├── login/
│   │   │   ├── view.html       # 页面 HTML 片段
│   │   │   └── index.js        # 页面逻辑
│   │   ├── register/
│   │   ├── record/             # 记账页
│   │   ├── detail/             # 明细页
│   │   ├── stats/              # 统计页
│   │   └── profile/            # 我的页
│   │
│   ├── scripts/                # ⚙️ 业务逻辑层
│   │   ├── router.js           # SPA 路由（按需加载 view.html）
│   │   ├── ui.js               # Toast / 粒子动画
│   │   ├── user.js             # 用户注册/登录/会话
│   │   └── bill.js             # 账单 CRUD + 数据隔离
│   │
│   └── utils/                  # 🛠️ 工具模块
│       ├── constants.js        # 常量（localStorage 键名 / 默认分类 / 校验规则）
│       ├── storage.js          # localStorage 封装
│       ├── crypto.js           # SHA-256 哈希
│       └── helpers.js          # ID 生成 / 日期格式化 / 小动物 Emoji
│
├── assets/images/              # 🖼️ 静态资源（预留）
├── docs/                       # 📚 文档目录（预留）
└── (stitch_prd/ 已删除)
```

---

## 🧩 组件复用关系

| 组件 | 登录 | 注册 | 记账 | 明细 | 统计 | 我的 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Header** |   |   | ✅ | ✅ | ✅ | ✅ |
| **TabBar** |   |   | ✅ | ✅ | ✅ | ✅ |
| **CategoryGrid** (select) |   |   | ✅ |   |   |   |
| **CategoryGrid** (filter) |   |   |   | ✅ |   |   |
| **CategoryGrid** (manage) |   |   |   |   |   | ✅ |
| **BillList** |   |   |   | ✅ |   |   |
| **NumberPad** |   |   | ✅ |   |   |   |
| **Modal** |   |   | ✅ |   |   |   |
| **EmptyState** |   |   |   | ✅ | ✅ | ✅ |

> CategoryGrid 通过 `mode` 参数切换三种用法（select/filter/manage），减少组件数量。

---

## 🚀 运行方式

由于使用了 `fetch()` 加载页面片段，**不能直接双击 index.html 打开**（浏览器 CORS 限制）。请使用本地服务器：

```bash
# 方式 1：Python
cd frontend
python -m http.server 8000
# 浏览器访问 http://localhost:8000

# 方式 2：Node.js
cd frontend
npx serve

# 方式 3：VSCode 插件 - Live Server
# 右键 index.html → Open with Live Server
```

---

## 🔗 页面跳转关系

所有页面跳转通过 `Router.navigateTo(route)` 实现，自动校验登录态：

```
┌─────────┐                      ┌──────────┐
│  登录页  │ ←────────────────→  │  注册页   │
└────┬────┘                      └──────────┘
     │ 登录成功
     ▼
┌──────────────────────────────────────┐
│  记账页（首页）                       │ ◄── 底部 Tab 切换 ──┐
│  ↓                                    │                    │
│  数字键盘 + 分类选择 + 备注 + 保存     │   ┌──────────┐    │
│  保存成功 → 飘出粒子 ✨                │   │   明细    │ ◄──┤
└──────────────────────────────────────┘   └──────────┘    │
                                                       ┌──────────┐    │
                                                       │   统计    │ ◄──┤
                                                       └──────────┘    │
                                                       ┌──────────┐    │
                                                       │   我的    │ ◄──┘
                                                       └──────────┘
```

### 加载流程（以 `Router.navigateTo('record')` 为例）

```
1. Router 校验登录态（未登录 → 跳转 LOGIN）
2. 检查缓存（首次访问会 fetch 'src/pages/record/view.html'）
3. 把 HTML 片段注入到 <main id="app-main">
4. 调用 Pages.record.onMount() 绑定事件
5. 显示 Header + TabBar，高亮当前 Tab
```

---

## 🎨 设计规范

完整设计 tokens 已提取到 [`tailwind.config.js`](./tailwind.config.js) 和 [`src/styles/main.css`](./src/styles/main.css)。

### 核心配色

| 角色 | 色值 | 用途 |
| :--- | :--- | :--- |
| 主色 - 樱花粉 | `#FFB7C5` | 主按钮、选中状态、强调 |
| 强调 - 奶油桃 | `#FFD1DC` | 次级按钮、标签 |
| 点缀 - 薰衣草紫 | `#E6E6FA` | 图标底色、空状态 |
| 支出 - 珊瑚红 | `#FF8A80` | 支出金额、警示 |
| 收入 - 薄荷绿 | `#A5D6A7` | 收入金额（V1.0 预留） |
| 文字 - 深灰棕 | `#5D4037` | 标题、重要正文 |

### UI 规范

- **圆角**：卡片 20px / 按钮 16px / 输入框 16px
- **阴影**：柔和弥散阴影 `rgba(255, 183, 197, 0.25)`
- **字体**：Plus Jakarta Sans + Be Vietnam Pro (Google Fonts)
- **动效**：按钮按下 `scale(0.96)` 弹性缩放、记账成功飘出粒子

---

## 💾 数据存储

所有数据存储在浏览器 `localStorage`，键名前缀 `expense_`：

| 键名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `expense_users_v1` | Array | 所有注册用户 |
| `expense_current_user_v1` | String | 当前登录用户 ID |
| `expense_records_v1` | Array | 消费记录（含 userId） |
| `expense_categories_v1` | Array | 自定义分类（含 userId） |
| `expense_streak_map_v1` | Object | `{ [userId]: { streak, lastDate } }` 按用户隔离 |

### 数据隔离

每条 `Record` 和自定义 `Category` 都通过 `userId` 字段关联到用户，查询时自动过滤，确保用户只能看到自己的数据。

---

## 🔐 安全说明

- 密码使用 **Web Crypto API** 计算 SHA-256 后存储，不存明文
- V1.0.1 仅客户端校验，真正的认证安全需要 V2.0 后端 JWT/Session
- 数据仅保存在本地，**多设备登录需要分别注册**（"我的"页有明确提示）

---

## 🛠️ 技术栈

| 类别 | 选型 |
| :--- | :--- |
| **HTML** | 原生 HTML5，移动端 viewport 优化 |
| **CSS** | 原生 CSS + CSS 变量（设计 tokens） |
| **JavaScript** | 原生 ES6+，无任何前端框架 |
| **路由** | 自研轻量 SPA 路由（fetch + 缓存） |
| **字体** | Plus Jakarta Sans + Be Vietnam Pro (Google Fonts) |
| **存储** | localStorage |
| **加密** | Web Crypto API (SHA-256) |

> **设计理念**：刻意不引入 React/Vue 等框架，让前端工程师可以专注于业务逻辑与 UI 细节，零构建即可运行。

---

## 📝 开发规范

1. **模块化**：每个组件/页面/工具一个独立文件，避免单文件超过 300 行
2. **页面结构**：每个页面在 `src/pages/<name>/` 目录下，`view.html` + `index.js` 两件套
3. **命名**：常量全大写、类 PascalCase、函数/变量 camelCase
4. **注释**：每个文件顶部 JSDoc 说明职责，函数注释参数和返回值
5. **数据隔离**：所有 `Record`/`Category` 操作必须经过 `BillModule`，自动附加 `userId`
6. **路由跳转**：所有页面切换必须通过 `Router.navigateTo(route)`，**禁止**直接改 DOM
7. **组件复用**：跨页面复用的 UI 必须抽到 `src/components/`，不要在页面内重复实现

---

## 🔮 后续规划

- **V2.0**：引入后端，实现云同步、收入记账、预算管理、资产账户
- **V3.0**：微信小程序端、微信/支付宝账单识别导入
- **V4.0**：智能消费趋势预测、年度报表

---

## 📌 原型对照

> 原型归档已删除（如需查阅，请联系产品经理）。设计规范已沉淀至 `tailwind.config.js` 和 `src/styles/main.css`。

| 功能页面 | 本项目路径 |
| :--- | :--- |
| 登录页 | `src/pages/login/` |
| 注册页 | `src/pages/register/` |
| 记账页 | `src/pages/record/` |
| 明细页 | `src/pages/detail/` |
| 统计页 | `src/pages/stats/` |
| 我的页 | `src/pages/profile/` |