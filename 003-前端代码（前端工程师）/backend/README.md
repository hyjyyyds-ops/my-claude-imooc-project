# 每日消费记录助手 - 后端服务

> **版本**：V1.0.1（实现登录 / 注册）
> **技术栈**：Vite + React 18 + Express + MySQL 9.7
> **角色定位**：与 `frontend/` 目录下的 vanilla JS 前端配合的后端 API 服务
> **当前 frontend 项目**：保留在 `003-前端代码（前端工程师）/frontend/`（独立 vanilla JS 项目）

---

## 📂 项目结构

```
backend/
├── server/                          # Express 后端
│   ├── index.js                     # 入口：启动 HTTP 服务
│   ├── config.js                    # 环境变量统一读取
│   ├── routes/
│   │   └── auth.js                  # /api/auth/register, /api/auth/login
│   └── lib/
│       ├── db.js                    # MySQL 连接池
│       ├── auth.js                  # bcrypt + JWT
│       └── validators.js            # 入参校验
│
├── src/                             # React 前端（API 测试 UI）
│   ├── main.jsx                     # 入口
│   ├── App.jsx                      # 路由
│   ├── api.js                       # API 客户端
│   ├── index.css                    # Tailwind 基础
│   └── pages/
│       ├── Home.jsx                 # 首页 / API 状态
│       ├── Login.jsx                # 登录页
│       ├── Register.jsx             # 注册页
│       └── Dashboard.jsx            # 登录后页面
│
├── index.html                       # Vite HTML 入口
├── package.json
├── vite.config.js                   # 含 /api 代理到 Express
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 快速开始

### 1. 前置条件

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18.0 | Vite 5 + React 18 要求 |
| MySQL | 9.x | 已通过 Docker 部署（端口 3307） |
| npm | ≥ 9 | 或 pnpm / yarn |

### 2. 数据库初始化

确保 `expense_tracker` 数据库已建好（参考 `004.数据库脚本`）：

```bash
docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 \
  < "d:/VsCode/claude-my-product/004.数据库脚本（数据库管理员）/01_schema.sql"

docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 \
  < "d:/VsCode/claude-my-product/004.数据库脚本（数据库管理员）/02_seed_data.sql"
```

### 3. 安装依赖

```bash
cd "d:/VsCode/claude-my-product/003-前端代码（前端工程师）/backend"
npm install
```

### 4. 配置环境变量

```bash
# .env.local 已自动从 .env.example 复制
# 按需修改 JWT_SECRET 等敏感字段
```

默认 `.env.local`：
```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=expense_tracker

JWT_SECRET=please_change_me_to_a_long_random_string_in_production
JWT_EXPIRES_IN=604800

CLIENT_URL=http://localhost:5173
PORT=3001
```

### 5. 启动开发环境

```bash
npm run dev
```

会自动并行启动：
- 🟦 **Vite** (React) → http://localhost:5173
- 🟩 **Express** (API) → http://localhost:3001

打开 http://localhost:5173 即可使用。

---

## 📡 API 接口

### POST /api/auth/register

**请求体：**
```json
{ "username": "test001", "password": "123456", "confirmPassword": "123456" }
```

**成功响应（201）：**
```json
{
  "success": true,
  "message": "注册成功 ✨",
  "user": { "id": "id_xxx", "username": "test001", "avatar": null, "createdAt": 1718092800000 },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**失败响应（400/409）：**
```json
{ "success": false, "message": "该用户名已被注册，换一个试试？" }
```

### POST /api/auth/login

**请求体：**
```json
{ "username": "test001", "password": "123456" }
```

**成功响应（200）：**
```json
{
  "success": true,
  "message": "登录成功 ✨",
  "user": { "id": "id_xxx", "username": "test001", "avatar": null, "createdAt": 1718092800000 },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/health

健康检查：测试 MySQL 连接。
```json
{ "ok": true, "db": "up" }
```

---

## 🧪 快速测试（curl）

```bash
# 注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test001","password":"123456","confirmPassword":"123456"}'

# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test001","password":"123456"}'

# 健康检查
curl http://localhost:3001/api/health
```

---

## 🔐 安全设计

| 措施 | 说明 |
|------|------|
| **密码哈希** | bcrypt（10 rounds），比 SHA-256 抗暴力破解 |
| **JWT 鉴权** | 登录后返回 token，默认 7 天有效 |
| **SQL 注入防护** | 全部使用参数化查询（`?` 占位符） |
| **用户名唯一** | 数据库 `UNIQUE` 约束 + 应用层双重校验 |
| **错误信息** | 不暴露内部异常，统一友好提示 |
| **CORS** | 仅允许 `CLIENT_URL` 来源（默认 Vite dev 端口） |
| **请求体大小** | 限制 1MB，防止 DoS |

> ⚠️ **生产环境必须修改**：`JWT_SECRET` 改为长随机字符串，启用 HTTPS

---

## 🗂️ localStorage 键名（与 V1.0.1 前端兼容）

| 键 | 类型 | 说明 |
|----|------|------|
| `expense_token_v1` | string | JWT，后续 API 请求需带上 |
| `expense_current_user_v1` | string | 当前登录用户 ID |
| `expense_user_v1` | JSON | 用户信息（id/username/avatar/createdAt） |

---

## 🔄 Vite 代理机制（开发环境）

```
浏览器访问 http://localhost:5173/api/auth/login
       ↓ Vite dev server 收到
       ↓ 匹配 /api 前缀
       ↓ 代理转发
       ↓ http://localhost:3001/api/auth/login
       ↓ Express 路由处理
       ↓ 返回 JSON
浏览器收到响应
```

> 这就是为什么前端代码可以写 `/api/auth/login` 而无需关心后端端口。

---

## 📦 生产环境部署

```bash
# 1. 构建前端
npm run build
# 产物输出到 dist/

# 2. 启动后端（自动托管 dist 静态资源）
npm start
# 监听 3001 端口，同时提供 API 和前端页面
```

或使用 PM2 / Docker 部署到云服务器。

---

## 📈 后续规划

- [ ] 退出登录 / 刷新 token
- [ ] 忘记密码 / 邮箱注册
- [ ] 用户头像上传（base64 存入 `t_user.avatar`）
- [ ] V2.0：`t_record` 增删改查 API
- [ ] V2.0：多端云同步（基于 `t_sync_log`）

---

## 🛠️ 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动 Vite + Express 开发环境（热更新） |
| `npm run build` | 构建前端到 `dist/` |
| `npm start` | 生产模式：Express 同时托管 API 和构建产物 |
| `npm run preview` | 仅预览 Vite 构建结果（不启动后端） |
