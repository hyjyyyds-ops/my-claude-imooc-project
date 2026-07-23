# Java 后端开发规范（Spring Boot）

> **版本**：V1.0
> **制定人**：架构组
> **适用范围**：`com.expense.*` 包下所有 Java 代码
> **参考标准**：阿里巴巴 Java 开发手册 + Google Java Style + Spring 官方最佳实践

本规范不是教条，目的是让代码：
- ✅ **可读性优先**：别人能在 30 秒内理解你的意图
- ✅ **统一风格**：避免风格之争（交给工具自动检查）
- ✅ **可维护性**：降低后人修改代码的心智负担
- ✅ **可观测性**：线上出问题能快速定位

---

## 📑 目录

1. [项目架构](#1-项目架构)
2. [命名规范](#2-命名规范)
3. [代码风格](#3-代码风格)
4. [包结构规范](#4-包结构规范)
5. [Controller 层规范](#5-controller-层规范)
6. [Service 层规范](#6-service-层规范)
7. [Mapper / 数据访问层规范](#7-mapper--数据访问层规范)
8. [实体类规范（Entity / DTO / VO）](#8-实体类规范entity--dto--vo)
9. [异常处理规范](#9-异常处理规范)
10. [日志规范](#10-日志规范)
11. [数据库规范](#11-数据库规范)
12. [API 设计规范](#12-api-设计规范)
13. [安全规范](#13-安全规范)
14. [测试规范](#14-测试规范)
15. [Git 提交规范](#15-git-提交规范)
16. [代码审查（Code Review）检查清单](#16-代码审查code-review检查清单)

---

## 1. 项目架构

### 1.1 分层架构

采用经典的 **4 层架构**，禁止跨层调用：

```
┌─────────────────────────────────────────────────┐
│  Controller 层（接口层）                           │
│  - 接收请求、参数校验、调用 Service、返回响应       │
│  - 不包含业务逻辑                                  │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Service 层（业务逻辑层）                          │
│  - 业务逻辑编排、事务控制、跨模块协调                │
│  - 抛出 BusinessException 而非返回错误码            │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Mapper 层（数据访问层）                           │
│  - 与数据库交互，不含业务逻辑                       │
│  - 单表操作用 MyBatis-Plus BaseMapper              │
│  - 复杂 SQL 写在 XML 文件中                         │
└─────────────────────────────────────────────────┘
                     ↓
                  MySQL 数据库
```

### 1.2 包命名

```
com.expense.tracker
├── ExpenseTrackerApplication.java   # 启动类，单数
├── common/                          # 公共组件（Result、异常、错误码）
├── config/                          # 配置类（CORS、拦截器、Swagger）
├── controller/                      # 接口层
├── service/                         # 服务层（接口 + 实现）
│   └── impl/                        # 实现类
├── mapper/                          # MyBatis Mapper 接口
├── entity/                          # 数据库实体（与表一一对应）
├── dto/                             # 数据传输对象（请求 / 响应）
├── interceptor/                     # 拦截器
├── util/                            # 工具类
└── exception/                       # 异常处理
```

> **禁止**：超过 4 层嵌套包；业务包直接放在 `com.expense.tracker` 下。

---

## 2. 命名规范

### 2.1 通用命名

| 类型 | 规范 | 示例 |
|------|------|------|
| **类名** | UpperCamelCase（名词或名词短语） | `UserService`, `OrderDetailDTO` |
| **方法名** | lowerCamelCase（动词或动词短语） | `getUserById`, `calculateTotal` |
| **变量名** | lowerCamelCase（名词） | `userName`, `orderList` |
| **常量名** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| **包名** | 全小写，点分隔，无下划线 | `com.expense.tracker.controller` |
| **抽象类** | `Abstract` 前缀 | `AbstractService` |
| **异常类** | `Exception` 后缀 | `BusinessException` |
| **测试类** | 与被测类同名 + `Test` 后缀 | `UserServiceTest` |

### 2.2 业务命名

| 类型 | 规范 | 示例 |
|------|------|------|
| **Service 接口** | `XxxService` | `UserService` |
| **Service 实现** | `XxxServiceImpl` | `UserServiceImpl` |
| **Mapper** | `XxxMapper` | `UserMapper` |
| **Controller** | `XxxController` | `UserController` |
| **实体类** | 表名去掉 `t_` 前缀，单数 | `t_user` → `User` |
| **DTO（请求）** | `XxxRequest` | `LoginRequest` |
| **DTO（响应）** | `XxxResponse` 或 `XxxVO` | `LoginResponse` |
| **视图对象** | `XxxVO` | `UserProfileVO` |

### 2.3 数据库命名

| 类型 | 规范 | 示例 |
|------|------|------|
| **表名** | `t_` 前缀 + snake_case（**复数**） | `t_users`, `t_records` |
| **字段名** | snake_case | `user_name`, `created_at` |
| **主键** | `id`（VARCHAR(32) UUID） | `id` |
| **外键** | `<关联表单数>_id` | `user_id`, `category_id` |
| **时间字段** | `_at` 后缀（毫秒时间戳） | `created_at`, `updated_at` |
| **日期字段** | `_date` 后缀（DATE 类型） | `record_date`, `last_date` |
| **布尔字段** | `is_` 前缀 | `is_custom`, `is_deleted` |
| **枚举字段** | `type` / `status`，TINYINT | `type` (1=支出, 2=收入) |

---

## 3. 代码风格

### 3.1 基础格式

| 项 | 规范 |
|----|------|
| **缩进** | 4 空格（禁用 Tab） |
| **行长度** | 120 字符（不超过此值） |
| **文件编码** | UTF-8 |
| **换行符** | LF（Linux 风格） |
| **类成员顺序** | 静态常量 → 静态变量 → 实例变量 → 构造器 → 公有方法 → 私有方法 |
| **方法顺序** | 公有方法在前，私有方法在后 |

### 3.2 Import 顺序

```java
// 1. 本项目 import
import com.expense.tracker.common.Result;
import com.expense.tracker.entity.User;

// 2. 第三方库 import
import lombok.Data;
import org.springframework.web.bind.annotation.GetMapping;

// 3. Java 标准库 import
import java.time.LocalDateTime;
import java.util.List;
```

- ✅ 每个分组之间空一行
- ✅ 禁用通配符 `import java.util.*;`

### 3.3 注释规范

**类级别 Javadoc**（必须）：

```java
/**
 * 用户服务实现类
 *
 * <p>处理用户注册、登录、信息查询等业务逻辑</p>
 *
 * @author sunhang
 * @since 1.0.1
 */
@Service
public class UserServiceImpl implements UserService {
```

**方法 Javadoc**（公开方法必须）：

```java
/**
 * 根据用户名查询用户
 *
 * @param username 用户名（3-20 位）
 * @return 用户实体，不存在时返回 null
 * @throws BusinessException 当用户名包含非法字符时
 */
public User getByUsername(String username) {
```

**行内注释**：解释 **WHY** 而不是 **WHAT**（代码本身说明 What）。

```java
// ❌ 不好：重复代码
total = total + 1;  // 加 1

// ✅ 好：解释原因
total = total + 1;  // 跳过系统内置分类（id < 1000）
```

---

## 4. 包结构规范

### 4.1 禁止循环依赖

```
ServiceA → ServiceB → ServiceA  ❌ 绝对禁止
```

### 4.2 类的可见性

| 场景 | 建议 |
|------|------|
| 工具方法 | `public static` |
| 仅本类用 | `private` |
| 子类用 | `protected` |
| 框架需要（如 Spring Bean） | `public` |

---

## 5. Controller 层规范

### 5.1 Controller 是"瘦"接口层

✅ **DO**：参数接收、调用 Service、返回包装响应
❌ **DON'T**：业务逻辑、数据转换、事务控制

```java
/**
 * ✅ 好的 Controller - 简洁清晰
 */
@Tag(name = "用户模块")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return Result.success("登录成功 ✨", response);
    }
}
```

### 5.2 必须遵守的规则

| 规则 | 说明 |
|------|------|
| **使用 `@RestController`** | 不要用 `@Controller` + `@ResponseBody` |
| **使用 `@RequiredArgsConstructor`** | 构造器注入，禁用 `@Autowired` 字段注入 |
| **使用 `@Valid`** | 入参必须做 Bean Validation |
| **统一返回 `Result<T>`** | 不用直接返回实体类 |
| **路径前缀用 `@RequestMapping`** | 类级别统一前缀，方法级别只写子路径 |
| **Swagger 注解必加** | `@Tag`（类）、`@Operation`（方法） |

### 5.3 参数接收规范

```java
// ✅ 简单参数用 @PathVariable（RESTful）
@GetMapping("/users/{id}")
public Result<User> getById(@PathVariable String id) { ... }

// ✅ 简单参数用 @RequestParam
@GetMapping("/users")
public Result<List<User>> list(@RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "20") int size) { ... }

// ✅ 复杂对象用 @RequestBody + @Valid
@PostMapping("/users")
public Result<User> create(@Valid @RequestBody CreateUserRequest request) { ... }

// ✅ Header 信息
@GetMapping("/me")
public Result<User> me(@RequestAttribute("currentUserId") String userId) { ... }
```

### 5.4 URL 设计规范（RESTful）

| 操作 | HTTP 方法 | URL | 说明 |
|------|----------|-----|------|
| 查询单个 | GET | `/users/{id}` | |
| 查询列表 | GET | `/users` | 支持分页参数 |
| 创建 | POST | `/users` | Body 传参 |
| 更新（全量） | PUT | `/users/{id}` | |
| 更新（部分） | PATCH | `/users/{id}` | |
| 删除 | DELETE | `/users/{id}` | |

**URL 风格**：
- ✅ 使用**复数名词**：`/users`、`/records`
- ✅ 使用**连字符**（不用下划线）：`/user-profiles`
- ✅ 全部小写
- ❌ 禁止动词：`/getUsers`、`/createUser`
- ❌ 禁止文件后缀：`.json`、`.xml`

---

## 6. Service 层规范

### 6.1 接口与实现分离

```java
// 接口（业务抽象）
public interface UserService {
    LoginResponse login(LoginRequest request);
    User register(RegisterRequest request);
}

// 实现（具体逻辑）
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse login(LoginRequest request) {
        // 1. 查用户
        User user = userMapper.selectByUsername(request.getUsername());
        if (user == null) {
            throw new BusinessException("该用户不存在，先注册一下吧~");
        }

        // 2. 验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("密码错了，再试一次？ 🥺");
        }

        // 3. 返回
        return LoginResponse.builder()
                .user(user)
                .token(jwtUtil.generate(user.getId(), user.getUsername()))
                .build();
    }
}
```

### 6.2 必须遵守的规则

| 规则 | 说明 |
|------|------|
| **每个 Service 接口 ≤ 20 个方法** | 过多说明职责不清，需拆分 |
| **方法必须有业务意图** | `login()` 比 `doLogin()`、`processLogin()` 更好 |
| **事务注解在 Service** | 不要在 Controller 加 `@Transactional` |
| **事务粒度要小** | 只包裹写操作，不要包含远程调用 |
| **抛 `BusinessException`** | 不要返回 `Result` 或 `boolean` 表示业务失败 |
| **Service 之间通过注入调用** | 不允许 `new` 另一个 Service |

### 6.3 事务使用规范

```java
// ✅ 推荐：明确指定 rollbackFor
@Transactional(rollbackFor = Exception.class)
public void createOrder(OrderRequest request) {
    // ...
}

// ✅ 只读事务优化性能
@Transactional(readOnly = true)
public Order getById(String id) {
    return orderMapper.selectById(id);
}

// ❌ 错误：默认只回滚 RuntimeException
@Transactional
public void createOrder(OrderRequest request) {
    // 抛出 IOException 时不会回滚！
}
```

---

## 7. Mapper / 数据访问层规范

### 7.1 单表 CRUD 用 BaseMapper

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 单表查询、插入、更新、删除 - 全部由 MyBatis-Plus 提供
    // - insert(user)
    // - updateById(user)
    // - selectById(id)
    // - selectList(queryWrapper)
    // - deleteById(id)
}
```

### 7.2 复杂查询用 XML

放在 `src/main/resources/mapper/` 下，与 Mapper 接口同名：

```
src/main/resources/mapper/
├── UserMapper.xml
├── RecordMapper.xml
└── CategoryMapper.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.expense.tracker.mapper.RecordMapper">

    <!-- 结果映射 -->
    <resultMap id="RecordWithCategoryMap" type="com.expense.tracker.dto.RecordWithCategoryVO">
        <id     property="id"          column="id"/>
        <result property="amount"      column="amount"/>
        <result property="categoryName" column="category_name"/>
        <!-- ... -->
    </resultMap>

    <!-- 复杂查询 -->
    <select id="selectMonthlyStats" resultMap="RecordWithCategoryMap">
        SELECT
            r.id, r.amount, r.remark,
            c.name AS category_name, c.icon AS category_icon
        FROM t_record r
        INNER JOIN t_category c ON r.category_id = c.id
        WHERE r.user_id = #{userId}
          AND r.record_date BETWEEN #{startDate} AND #{endDate}
        ORDER BY r.record_date DESC, r.created_at DESC
    </select>
</mapper>
```

### 7.3 必须遵守的规则

| 规则 | 说明 |
|------|------|
| **所有 SQL 必须参数化** | 禁止字符串拼接，杜绝 SQL 注入 |
| **复杂 JOIN 查询写在 XML** | 不要用 `@Select` 注解写大 SQL |
| **分页必须用 MyBatis-Plus `Page`** | 不要手写 LIMIT |
| **批量操作使用 `insertBatch` / `updateBatchById`** | 不要循环单条调用 |
| **删除前确认无业务关联** | 除非确认无依赖，否则用 `ON DELETE RESTRICT` |

---

## 8. 实体类规范（Entity / DTO / VO）

### 8.1 三种对象的区别

| 类型 | 用途 | 与数据库关系 | 是否可序列化 |
|------|------|------------|------------|
| **Entity** | 数据库映射 | 一一对应表 | ❌ |
| **DTO（Request）** | 接收请求参数 | 无关 | ✅ |
| **VO（Response）** | 返回给前端 | 无关 | ✅ |

> **核心原则**：Entity 不出 Controller 层，DTO/VO 不进 Mapper 层。

### 8.2 Entity 必须遵守

```java
@Data
@TableName("t_user")
public class User implements Serializable {  // ✅ 必须实现 Serializable

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;                       // ✅ 主键必须

    private String username;

    @TableField("password_hash")             // ✅ 字段名映射
    private String passwordHash;

    @TableField("created_at")
    private Long createdAt;

    // ❌ 禁止：业务方法
    // public boolean checkPassword(...) { ... }
}
```

**禁用**：
- ❌ Entity 中放业务方法
- ❌ Entity 中放复杂集合（懒加载字段）
- ❌ Entity 用于返回给前端（暴露 password_hash 风险）

### 8.3 DTO/VO 推荐使用 Lombok + Builder

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "请输入用户名 🥺")
    @Size(min = 3, max = 20, message = "用户名长度需在 3-20 位之间")
    private String username;

    @NotBlank(message = "请输入密码 🔒")
    @Size(min = 6, max = 20, message = "密码长度需在 6-20 位之间")
    private String password;
}
```

---

## 9. 异常处理规范

### 9.1 异常分类

| 异常类型 | 使用场景 | HTTP 状态码 |
|---------|---------|------------|
| `BusinessException` | 业务校验失败（用户不存在、密码错误） | 400 / 自定义 |
| `MethodArgumentNotValidException` | `@Valid` 校验失败 | 400 |
| `Exception` | 系统兜底 | 500 |

### 9.2 业务异常必须带语义

```java
// ✅ 好：信息明确
throw new BusinessException("用户名已被注册");

// ❌ 差：信息缺失
throw new BusinessException("错误");
```

### 9.3 禁止在 Controller / Service 捕获所有异常

```java
// ❌ 禁止
try {
    userService.login(request);
} catch (Exception e) {
    return Result.error("失败");
}

// ✅ 正确：让全局异常处理器统一处理
public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return Result.success(userService.login(request));
}
```

---

## 10. 日志规范

### 10.1 必须使用 SLF4J + Lombok `@Slf4j`

```java
@Slf4j
@Service
public class UserServiceImpl {

    public void register(User user) {
        log.info("注册用户: username={}", user.getUsername());
    }
}
```

### 10.2 日志级别使用

| 级别 | 场景 | 示例 |
|------|------|------|
| **ERROR** | 影响业务运行的错误 | `log.error("数据库连接失败", e)` |
| **WARN** | 可恢复的异常情况 | `log.warn("用户 {} 登录密码错误", username)` |
| **INFO** | 关键业务节点 | `log.info("用户注册成功: id={}", user.getId())` |
| **DEBUG** | 调试信息（生产关闭） | `log.debug("SQL: {}", sql)` |

### 10.3 日志格式规范

```java
// ✅ 推荐：占位符，不拼字符串
log.info("用户注册成功: id={}, username={}", user.getId(), user.getUsername());

// ❌ 不推荐：字符串拼接（性能差，无法结构化）
log.info("用户注册成功: id=" + user.getId() + ", username=" + user.getUsername());
```

### 10.4 禁止日志的敏感信息

```java
// ❌ 绝对禁止
log.info("用户登录: password={}", password);
log.info("请求参数: {}", request.toString());  // 如果包含敏感字段

// ✅ 脱敏
log.info("用户登录: username={}, password=******", username);
```

---

## 11. 数据库规范

### 11.1 表设计原则

| 规则 | 说明 |
|------|------|
| **每张表必须有 `id` 主键** | VARCHAR(32) UUID |
| **必须有审计字段** | `created_at`, `updated_at`（毫秒时间戳） |
| **大字段单独成表** | 例如 `avatar` (MEDIUMTEXT) 可独立 |
| **金额用 DECIMAL** | 严禁 FLOAT / DOUBLE |
| **逻辑删除用 `deleted`** | TINYINT(1)，0=未删，1=已删 |
| **字符集 utf8mb4** | 支持 Emoji（如 🍔🎬） |
| **排序规则 utf8mb4_unicode_ci** | 标准 Unicode 排序 |

### 11.2 索引设计原则

| 场景 | 建议索引 |
|------|---------|
| 主键查询 | 主键自动 |
| 按用户 + 日期范围查 | `(user_id, record_date)` |
| 按用户 + 分类查 | `(user_id, category_id)` |
| 唯一约束（如用户名） | `UNIQUE KEY` |

### 11.3 SQL 编写规范

```sql
-- ✅ 推荐
SELECT id, username, created_at
FROM t_user
WHERE id = #{userId}
  AND deleted = 0
LIMIT 1;

-- ❌ 禁止 SELECT *
SELECT * FROM t_user;

-- ❌ 禁止 WHERE 字段运算
WHERE DATE(created_at) = '2026-07-23';
-- ✅ 应改为
WHERE created_at BETWEEN 1718092800000 AND 1718179200000;
```

---

## 12. API 设计规范

### 12.1 统一响应格式

```json
{
  "success": true,
  "message": "操作成功 ✨",
  "data": { ... }
}
```

| 场景 | success | message | data |
|------|:-------:|---------|------|
| 成功 | `true` | "操作成功" | 业务数据 |
| 业务失败 | `false` | 错误信息 | `null` |
| 系统错误 | `false` | "服务器开小差" | `null` |

### 12.2 分页响应格式

```json
{
  "success": true,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "size": 20,
    "pages": 5
  }
}
```

### 12.3 时间字段格式

| 类型 | 格式 | 示例 |
|------|------|------|
| 时间戳（毫秒） | Long | `1718092800000` |
| ISO 8601 | String | `"2026-07-23T10:29:04"` |
| 日期 | String (YYYY-MM-DD) | `"2026-07-23"` |

> **本项目规范**：使用毫秒时间戳（与前端对齐），日期用 `YYYY-MM-DD` 字符串。

---

## 13. 安全规范

### 13.1 密码处理

```java
// ✅ 必须用 bcrypt
private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(10);

// ❌ 绝对禁止
// - 明文存储
// - MD5 / SHA-1 / SHA-256（无盐，易破解）
// - 自创加密算法
```

### 13.2 SQL 注入防护

| 方式 | 强制 |
|------|:----:|
| 使用 `?` 参数化 | ✅ |
| 使用 `#{}` MyBatis 参数绑定 | ✅ |
| 字符串拼接 SQL | ❌ |

### 13.3 XSS 防护

```java
// 前端：用户输入展示时必须 escape
// 后端：不存 HTML 原样，统一存纯文本
```

### 13.4 鉴权

| 接口 | 是否需要 Token |
|------|:------------:|
| `/auth/login`, `/auth/register` | ❌ |
| `/health`, `/hello/**` | ❌ |
| `/swagger-ui/**` | ❌ |
| `/records/**`, `/categories/**`, `/users/**` | ✅ |
| 其他业务接口 | ✅ |

---

## 14. 测试规范

### 14.1 测试覆盖要求

| 类型 | 覆盖率要求 |
|------|:---------:|
| Service 层 | ≥ 80% |
| Controller 层 | ≥ 60% |
| Util 工具类 | ≥ 90% |
| Mapper / SQL | 不强制（手动验证） |

### 14.2 测试类命名

```
UserService         → UserServiceTest
UserController      → UserControllerTest
RecordMapper        → RecordMapperTest（可选）
JwtUtil             → JwtUtilTest
```

### 14.3 单测示例

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void login_whenUserNotExists_throwsException() {
        when(userMapper.selectByUsername("ghost")).thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> userService.login(new LoginRequest("ghost", "any")));

        assertThat(ex.getMessage()).contains("该用户不存在");
    }
}
```

---

## 15. Git 提交规范

### 15.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

| type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 实现用户注册登录` |
| `fix` | Bug 修复 | `fix(record): 修复删除记录后 streak 未更新` |
| `refactor` | 重构（无功能变化） | `refactor(service): 抽取公共校验逻辑` |
| `docs` | 文档变更 | `docs: 更新 README` |
| `test` | 测试 | `test: 补充 UserService 单测` |
| `chore` | 构建/工具 | `chore: 升级 Spring Boot 到 2.7.18` |
| `perf` | 性能优化 | `perf: 分类查询增加复合索引` |

### 15.2 Branch 命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 主分支 | `main` / `master` | - |
| 功能分支 | `feature/<name>` | `feature/user-auth` |
| Bug 修复 | `fix/<name>` | `fix/login-error` |
| 发布分支 | `release/<version>` | `release/v1.0.1` |

---

## 16. 代码审查（Code Review）检查清单

### 16.1 提交前自查

- [ ] 是否遵循本规范？
- [ ] 是否新增/修改了 Entity、Mapper、Service、Controller 对应的所有层？
- [ ] 是否写了单元测试？
- [ ] 是否更新了 Swagger 注解？
- [ ] 是否在 IDEA 中运行 `mvn compile` 通过？
- [ ] 是否运行 `mvn test` 通过？
- [ ] 是否有遗留的 `System.out.println`、`TODO`？

### 16.2 Reviewer 关注点

| 维度 | 问题 |
|------|------|
| **正确性** | 业务逻辑是否完整？边界条件是否处理？ |
| **安全性** | 是否有 SQL 注入、XSS、敏感信息泄露？ |
| **性能** | 是否有 N+1 查询？是否有缺失的索引？ |
| **可读性** | 命名是否清晰？注释是否解释 Why 而非 What？ |
| **可测性** | Service 方法是否方便 mock 测试？ |
| **兼容性** | 是否会破坏现有 API？是否考虑向后兼容？ |

---

## 📚 推荐工具

### 静态检查（CI 阶段必跑）

```xml
<!-- pom.xml 中加入 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.3.3</version>
</dependency>
```

| 工具 | 用途 |
|------|------|
| **Spotless** | 代码格式化（自动套用本规范） |
| **Checkstyle** | 命名规范、Import 顺序 |
| **PMD** | 潜在 Bug（空 catch、重复代码） |
| **SonarQube** | 全方位代码质量扫描 |

### IDEA 推荐插件

- **Alibaba Java Coding Guidelines**（阿里规约）
- **Lombok**（自动生成样板代码）
- **MyBatisX**（Mapper 与 XML 跳转）
- **MyBatis Log**（SQL 日志格式化）
- **GitToolBox**（Git 增强）

---

## ✅ 自检命令（提交前必跑）

```bash
mvn clean compile          # 编译通过
mvn test                   # 单元测试通过
mvn spring-boot:run        # 启动成功（手动访问 /api/hello 验证）
```

---

## 📜 版本记录

| 版本 | 日期 | 修订内容 |
|:----:|:----:|:--------|
| V1.0 | 2026-07-23 | 初版，覆盖项目初始化所需的所有规范 |

---

**本规范将随项目演进持续更新。如有疑问或建议，提 PR 给架构组。**