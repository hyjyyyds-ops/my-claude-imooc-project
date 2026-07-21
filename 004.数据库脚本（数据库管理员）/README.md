# 每日消费记录助手 - 数据库设计文档

> **版本**：V1.0.1
> **数据库**：MySQL 9.7.0
> **字符集**：utf8mb4 / utf8mb4_unicode_ci
> **存储引擎**：InnoDB

---

## 📂 目录结构

```
004.数据库脚本（数据库管理员）/
├── README.md                  本文档（设计说明）
├── 01_schema.sql              建库 + 建表 DDL
├── 02_seed_data.sql           系统预设数据（8 个默认分类）
├── 03_sample_queries.sql      示例查询（统计、排行等）
└── 04_v2_planned_tables.sql   V2.0 计划表（暂不创建）
```

---

## 🗄️ 表结构概览

### 1. t_user（用户表）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|:----:|------|------|
| `id` | VARCHAR(32) | ✅ | - | 主键，UUID 字符串 |
| `username` | VARCHAR(20) | ✅ | - | 用户名，3-20 位，唯一 |
| `password_hash` | CHAR(64) | ✅ | - | 密码 SHA-256 哈希（十六进制 64 字符） |
| `avatar` | MEDIUMTEXT | ❌ | NULL | 头像 Base64 编码（V1.0.1 新增） |
| `streak` | INT | ✅ | 0 | 连续记账天数 |
| `last_date` | DATE | ❌ | NULL | 最后一次记账日期 |
| `created_at` | BIGINT | ✅ | - | 注册时间戳（毫秒） |
| `updated_at` | BIGINT | ✅ | - | 更新时间戳（毫秒） |

**索引**：`PRIMARY KEY (id)`, `UNIQUE KEY uk_username (username)`

---

### 2. t_category（消费分类表）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|:----:|------|------|
| `id` | VARCHAR(32) | ✅ | - | 主键，系统分类如 `cat_dining`，自定义如 `cat_custom_xxx` |
| `user_id` | VARCHAR(32) | ❌ | NULL | 所属用户 ID（**系统预设为 NULL**，所有用户共享） |
| `name` | VARCHAR(20) | ✅ | - | 分类名称 |
| `icon` | VARCHAR(16) | ✅ | - | 图标（Emoji 表情） |
| `type` | TINYINT | ✅ | 1 | 类型：**1=支出**，2=收入（V2.0） |
| `is_custom` | TINYINT(1) | ✅ | 0 | 是否自定义：**0=系统预设**，1=用户自定义 |
| `sort_order` | INT | ✅ | 0 | 排序权重（值越小越靠前） |
| `created_at` | BIGINT | ✅ | - | 创建时间戳（毫秒） |

**索引**：
- `PRIMARY KEY (id)`
- `KEY idx_user_id (user_id)` — 按用户查分类
- `KEY idx_user_type (user_id, type)` — 按用户+类型查分类

**外键**：`user_id` → `t_user(id)` ON DELETE CASCADE

---

### 3. t_record（消费记录表）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|:----:|------|------|
| `id` | VARCHAR(32) | ✅ | - | 主键，UUID 字符串 |
| `user_id` | VARCHAR(32) | ✅ | - | 所属用户 ID |
| `amount` | DECIMAL(10,2) | ✅ | - | 金额（单位：元，最大 99999999.99） |
| `type` | TINYINT | ✅ | 1 | 类型：**1=支出**，2=收入（V2.0） |
| `category_id` | VARCHAR(32) | ✅ | - | 分类 ID |
| `remark` | VARCHAR(50) | ✅ | '' | 备注，最大 50 字符 |
| `record_date` | DATE | ✅ | - | 记账日期（YYYY-MM-DD） |
| `created_at` | BIGINT | ✅ | - | 创建时间戳（毫秒） |
| `updated_at` | BIGINT | ✅ | - | 更新时间戳（毫秒） |

**索引**：
- `PRIMARY KEY (id)`
- `KEY idx_user_date (user_id, record_date)` — **统计页按月份查**
- `KEY idx_user_category (user_id, category_id)` — **分类筛选**
- `KEY idx_user_created (user_id, created_at)` — **按创建时间排序**
- `KEY idx_date (record_date)` — 全局日期查询

**外键**：
- `user_id` → `t_user(id)` ON DELETE CASCADE
- `category_id` → `t_category(id)` ON DELETE RESTRICT

---

## 🚀 部署步骤

### 一键初始化

```bash
# 1. 登录 MySQL
mysql -h 127.0.0.1 -P 3307 -u root -p

# 2. 执行建表脚本
source /path/to/01_schema.sql
source /path/to/02_seed_data.sql

# 3. 验证
USE expense_tracker;
SHOW TABLES;
SELECT * FROM t_category;
```

### 使用命令行直接执行

```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot < 01_schema.sql
mysql -h 127.0.0.1 -P 3307 -u root -proot < 02_seed_data.sql
```

---

## 🔍 核心查询场景

### 按月统计总支出（统计页"本月"Tab）
```sql
SELECT SUM(amount) AS total, COUNT(*) AS cnt
FROM t_record
WHERE user_id = ? AND type = 1
  AND record_date BETWEEN '2026-07-01' AND '2026-07-31';
```

### 按分类统计占比（甜甜圈图）
```sql
SELECT c.id, c.name, c.icon, SUM(r.amount) AS total
FROM t_record r
JOIN t_category c ON r.category_id = c.id
WHERE r.user_id = ? AND r.type = 1
  AND r.record_date BETWEEN ? AND ?
GROUP BY c.id
ORDER BY total DESC;
```

### 连续记账天数
```sql
SELECT streak, last_date
FROM t_user
WHERE id = ?;
```

### 列表分页（按日期倒序）
```sql
SELECT r.*, c.name AS category_name, c.icon AS category_icon
FROM t_record r
JOIN t_category c ON r.category_id = c.id
WHERE r.user_id = ?
ORDER BY r.record_date DESC, r.created_at DESC
LIMIT 20 OFFSET 0;
```

---

## 🔐 安全建议

1. **密码**：本表存储的是 SHA-256 哈希值（前端用 Web Crypto API 计算）。**生产环境应升级为 bcrypt/argon2 + salt**。
2. **数据库用户**：生产环境应创建专用用户，不使用 root：
   ```sql
   CREATE USER 'expense_app'@'%' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON expense_tracker.* TO 'expense_app'@'%';
   FLUSH PRIVILEGES;
   ```
3. **数据隔离**：所有业务查询必须带上 `user_id` 条件。
4. **连接加密**：生产环境建议启用 SSL。

---

## 📈 V2.0 计划表（暂不创建）

详见 `04_v2_planned_tables.sql`，包含：
- `t_account` — 资产账户（银行卡/微信/支付宝等）
- `t_budget` — 月度预算
- `t_transfer` — 账户间转账
- `t_income` — 收入明细（可与 t_record 合并，倾向后者扩展 type 字段）

---

## 📝 变更记录

| 版本 | 日期 | 内容 |
|:---:|:---:|:---|
| V1.0.1 | 2026-07-21 | 初版：3 张核心表，支持用户系统 + 数据隔离 |