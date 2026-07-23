# 每日消费记录助手 - Java 后端服务

> **版本**：V1.0.1（项目初始化）
> **技术栈**：Spring Boot 2.7.18 + JDK 11 + MyBatis-Plus 3.5 + MySQL 9.7
> **目的**：与 Node.js Express 后端（`003-前端代码/backend/`）并存，可作为 Java 技术栈的替代实现
> **数据库**：依赖 `004.数据库脚本/` 中的表结构

---

## 📂 项目结构

```
005.后端代码（Java工程师）/
├── pom.xml                                # Maven 配置
├── src/main/java/com/expense/tracker/
│   ├── ExpenseTrackerApplication.java     # 启动类
│   ├── common/
│   │   ├── Result.java                    # 统一响应 { success, message, data }
│   │   ├── ResultCode.java                # 响应码枚举
│   │   └── BusinessException.java         # 业务异常
│   ├── config/
│   │   ├── CorsConfig.java                # CORS 跨域
│   │   ├── MybatisPlusConfig.java         # 分页插件
│   │   ├── OpenApiConfig.java             # Swagger / OpenAPI
│   │   └── WebMvcConfig.java              # 注册 JWT 拦截器
│   ├── entity/
│   │   ├── User.java                      # t_user 表
│   │   ├── Category.java                  # t_category 表
│   │   └── Record.java                    # t_record 表
│   ├── mapper/
│   │   ├── UserMapper.java
│   │   ├── CategoryMapper.java
│   │   └── RecordMapper.java
│   ├── interceptor/
│   │   └── JwtInterceptor.java            # JWT 鉴权拦截器
│   ├── util/
│   │   └── JwtUtil.java                   # JWT 签发 / 解析
│   ├── exception/
│   │   └── GlobalExceptionHandler.java    # 全局异常处理
│   ├── controller/                        # （待实现：AuthController 等）
│   ├── service/                           # （待实现）
│   └── dto/                               # （待实现：LoginRequest 等）
└── src/main/resources/
    ├── application.yml                    # 主配置
    └── mapper/                            # （待实现：XML 映射文件）
```

---

## 🚀 快速开始

### 1. 前置条件

| 依赖 | 版本 | 说明 |
|------|------|------|
| JDK | 11 | 已在 `JAVA_HOME=D:\Program Files\Java\jdk-11` |
| Maven | 3.8.4 | 已在 `M2_HOME=D:\Program Files\apache-maven-3.8.4` |
| MySQL | 9.7.0 | Docker 容器，端口 3307 |

### 2. 初始化数据库

```bash
docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 \
  < "d:/VsCode/claude-my-product/004.数据库脚本（数据库管理员）/01_schema.sql"

docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 \
  < "d:/VsCode/claude-my-product/004.数据库脚本（数据库管理员）/02_seed_data.sql"
```

### 3. 启动项目

```bash
cd "d:/VsCode/claude-my-product/005.后端代码（Java工程师）"
mvn spring-boot:run
```

或者先打包再运行：
```bash
mvn clean package
java -jar target/expense-tracker-backend.jar
```

### 4. 访问接口

| 地址 | 用途 |
|------|------|
| http://localhost:8080/api/swagger-ui.html | Swagger UI（在线 API 文档） |
| http://localhost:8080/api/v3/api-docs | OpenAPI 3.0 JSON |

---

## 🔧 技术选型理由

| 选型 | 理由 |
|------|------|
| **Spring Boot 2.7** | 与 JDK 11 兼容、稳定；3.x 强制 JDK 17+ |
| **MyBatis-Plus** | 国内最流行，单表 CRUD 自动生成，SQL 灵活 |
| **Lombok** | 消除 getter/setter 样板代码 |
| **Hutool** | 国产工具集，覆盖 Date/IdUtil/StrUtil 等 |
| **JJWT 0.11** | 主流 Java JWT 库 |
| **SpringDoc OpenAPI 1.7** | Spring Boot 2.7 兼容版本（3.x 兼容 Spring Boot 3） |
| **Jakarta Validation** | `javax.validation`（Spring Boot 2.7 仍用 javax.*） |

---

## 📊 待实现的 Controller

按之前梳理的功能清单，逐步实现：

| 优先级 | Controller | 接口数 | 状态 |
|:------:|-----------|:------:|:----:|
| P0 | AuthController | 2 | ⏳ |
| P0 | RecordController | 5 | ⏳ |
| P0 | CategoryController | 3 | ⏳ |
| P1 | StatsController | 1 | ⏳ |
| P1 | UserController | 3 | ⏳ |
| P2 | DataController | 3 | ⏳ |

---

## 🛡️ 内置能力（已完成）

- ✅ JWT 鉴权拦截器（自动解析 `Authorization: Bearer xxx`）
- ✅ CORS 跨域（允许 localhost 任意端口）
- ✅ 统一响应 `{ success, message, data }`
- ✅ 全局异常处理（业务异常 / 参数校验 / 兜底）
- ✅ Swagger UI 文档
- ✅ MyBatis-Plus 分页插件
- ✅ HikariCP 连接池

---

## 📝 常用命令

```bash
# 开发模式
mvn spring-boot:run

# 清理 + 编译 + 打包
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 运行单元测试
mvn test
```