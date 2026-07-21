-- =============================================================================
-- 每日消费记录助手 - 数据库 Schema
-- 版本: V1.0.1
-- 数据库: MySQL 9.7.0
-- 字符集: utf8mb4 (支持 Emoji)
-- 引擎:   InnoDB
-- 说明:   包含建库 + 3 张核心表（用户、分类、消费记录）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 创建数据库
-- -----------------------------------------------------------------------------
DROP DATABASE IF EXISTS `expense_tracker`;
CREATE DATABASE `expense_tracker`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `expense_tracker`;

-- -----------------------------------------------------------------------------
-- 2. 用户表 (t_user)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id`            VARCHAR(32)  NOT NULL                  COMMENT '用户ID，UUID 字符串',
  `username`      VARCHAR(20)  NOT NULL                  COMMENT '用户名，3-20 位，唯一',
  `password_hash` CHAR(64)     NOT NULL                  COMMENT '密码 SHA-256 哈希（64 位十六进制）',
  `avatar`        MEDIUMTEXT   NULL                      COMMENT '用户头像，Base64 编码（V1.0.1 新增）',
  `streak`        INT          NOT NULL DEFAULT 0        COMMENT '连续记账天数',
  `last_date`     DATE         NULL                      COMMENT '最后记账日期（YYYY-MM-DD）',
  `created_at`    BIGINT       NOT NULL                  COMMENT '注册时间戳（毫秒）',
  `updated_at`    BIGINT       NOT NULL                  COMMENT '更新时间戳（毫秒）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';

-- -----------------------------------------------------------------------------
-- 3. 消费分类表 (t_category)
--    系统预设分类: user_id = NULL，所有用户共享
--    自定义分类:   user_id = <UUID>，归属特定用户
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `t_category`;
CREATE TABLE `t_category` (
  `id`          VARCHAR(32)  NOT NULL                  COMMENT '分类ID（系统：cat_xxx；自定义：cat_custom_xxx）',
  `user_id`     VARCHAR(32)  NULL                      COMMENT '所属用户ID（系统预设为 NULL）',
  `name`        VARCHAR(20)  NOT NULL                  COMMENT '分类名称',
  `icon`        VARCHAR(16)  NOT NULL                  COMMENT '分类图标（Emoji 字符串）',
  `type`        TINYINT      NOT NULL DEFAULT 1        COMMENT '类型：1=支出，2=收入（V2.0 预留）',
  `is_custom`   TINYINT(1)   NOT NULL DEFAULT 0        COMMENT '是否自定义：0=系统预设，1=用户自定义',
  `sort_order`  INT          NOT NULL DEFAULT 0        COMMENT '排序权重（值越小越靠前）',
  `created_at`  BIGINT       NOT NULL                  COMMENT '创建时间戳（毫秒）',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_type` (`user_id`, `type`),
  KEY `idx_type_custom` (`type`, `is_custom`),
  CONSTRAINT `fk_category_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='消费分类表（系统预设 + 用户自定义）';

-- -----------------------------------------------------------------------------
-- 4. 消费记录表 (t_record)
--    每条记录归属于一个用户和一个分类
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `t_record`;
CREATE TABLE `t_record` (
  `id`           VARCHAR(32)      NOT NULL              COMMENT '记录ID，UUID 字符串',
  `user_id`      VARCHAR(32)      NOT NULL              COMMENT '所属用户ID',
  `amount`       DECIMAL(10, 2)   NOT NULL              COMMENT '金额（单位：元，保留 2 位小数）',
  `type`         TINYINT          NOT NULL DEFAULT 1    COMMENT '类型：1=支出，2=收入（V2.0 预留）',
  `category_id`  VARCHAR(32)      NOT NULL              COMMENT '分类ID',
  `remark`       VARCHAR(50)      NOT NULL DEFAULT ''   COMMENT '备注（最大 50 字符）',
  `record_date`  DATE             NOT NULL              COMMENT '记账日期（YYYY-MM-DD）',
  `created_at`   BIGINT           NOT NULL              COMMENT '创建时间戳（毫秒）',
  `updated_at`   BIGINT           NOT NULL              COMMENT '更新时间戳（毫秒）',
  PRIMARY KEY (`id`),
  -- 统计页"本月"查询（按用户+日期范围）
  KEY `idx_user_date` (`user_id`, `record_date`),
  -- 分类筛选/占比
  KEY `idx_user_category` (`user_id`, `category_id`),
  -- 列表按创建时间排序
  KEY `idx_user_created` (`user_id`, `created_at`),
  -- 全局日期查询（运营分析）
  KEY `idx_date` (`record_date`),
  -- 联合索引优化统计查询
  KEY `idx_user_type_date` (`user_id`, `type`, `record_date`),
  CONSTRAINT `fk_record_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_record_category`
    FOREIGN KEY (`category_id`) REFERENCES `t_category`(`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_amount_positive`
    CHECK (`amount` > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='消费记录表';

-- =============================================================================
-- 完成
-- =============================================================================