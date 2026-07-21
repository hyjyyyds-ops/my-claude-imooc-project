-- =============================================================================
-- 每日消费记录助手 - V2.0 计划表（暂不创建，仅作规划）
-- 版本: V2.0 规划稿
-- 说明: 这些表用于未来云同步、资产管理、预算功能
--       当前 V1.0.1 不执行此脚本
-- =============================================================================

USE `expense_tracker`;

-- -----------------------------------------------------------------------------
-- 1. 资产账户表 (t_account)
--    用于区分不同资金来源（微信/支付宝/银行卡/现金等）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_account` (
  `id`          VARCHAR(32)    NOT NULL                  COMMENT '账户ID',
  `user_id`     VARCHAR(32)    NOT NULL                  COMMENT '所属用户ID',
  `name`        VARCHAR(20)    NOT NULL                  COMMENT '账户名称（如：微信、支付宝、招行卡）',
  `icon`        VARCHAR(16)    NOT NULL                  COMMENT '账户图标（Emoji）',
  `type`        VARCHAR(16)    NOT NULL                  COMMENT '账户类型：cash/wechat/alipay/bank/other',
  `balance`     DECIMAL(12, 2) NOT NULL DEFAULT 0        COMMENT '账户余额',
  `is_archived` TINYINT(1)     NOT NULL DEFAULT 0        COMMENT '是否归档：0=使用中，1=已归档',
  `sort_order`  INT            NOT NULL DEFAULT 0        COMMENT '排序',
  `created_at`  BIGINT         NOT NULL                  COMMENT '创建时间戳（毫秒）',
  `updated_at`  BIGINT         NOT NULL                  COMMENT '更新时间戳（毫秒）',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_account_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='资产账户表（V2.0）';

-- -----------------------------------------------------------------------------
-- 2. 月度预算表 (t_budget)
--    用于预算控制和超支提醒
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_budget` (
  `id`          VARCHAR(32)  NOT NULL                  COMMENT '预算ID',
  `user_id`     VARCHAR(32)  NOT NULL                  COMMENT '所属用户ID',
  `category_id` VARCHAR(32)  NULL                      COMMENT '分类ID（NULL 表示总预算）',
  `amount`      DECIMAL(10, 2) NOT NULL                COMMENT '预算金额',
  `period`      VARCHAR(8)   NOT NULL                  COMMENT '周期：YYYY-MM',
  `alert_threshold` INT       NOT NULL DEFAULT 80      COMMENT '提醒阈值（百分比）',
  `created_at`  BIGINT       NOT NULL                  COMMENT '创建时间戳（毫秒）',
  `updated_at`  BIGINT       NOT NULL                  COMMENT '更新时间戳（毫秒）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_category_period` (`user_id`, `category_id`, `period`),
  KEY `idx_period` (`period`),
  CONSTRAINT `fk_budget_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_budget_category`
    FOREIGN KEY (`category_id`) REFERENCES `t_category`(`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='月度预算表（V2.0）';

-- -----------------------------------------------------------------------------
-- 3. 账户间转账表 (t_transfer)
--    记录账户间的资金流转
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_transfer` (
  `id`             VARCHAR(32)      NOT NULL              COMMENT '转账ID',
  `user_id`        VARCHAR(32)      NOT NULL              COMMENT '所属用户ID',
  `from_account_id` VARCHAR(32)     NOT NULL              COMMENT '转出账户ID',
  `to_account_id`   VARCHAR(32)     NOT NULL              COMMENT '转入账户ID',
  `amount`         DECIMAL(10, 2)   NOT NULL              COMMENT '转账金额',
  `remark`         VARCHAR(50)      NOT NULL DEFAULT ''   COMMENT '备注',
  `transfer_date`  DATE             NOT NULL              COMMENT '转账日期',
  `created_at`     BIGINT           NOT NULL              COMMENT '创建时间戳（毫秒）',
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`, `transfer_date`),
  CONSTRAINT `fk_transfer_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='账户间转账表（V2.0）';

-- -----------------------------------------------------------------------------
-- 4. 数据同步日志表 (t_sync_log)
--    多端同步时记录变更，用于冲突检测和增量同步
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_sync_log` (
  `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '同步日志ID',
  `user_id`       VARCHAR(32)     NOT NULL                COMMENT '所属用户ID',
  `entity_type`   VARCHAR(16)     NOT NULL                COMMENT '实体类型：user/category/record',
  `entity_id`     VARCHAR(32)     NOT NULL                COMMENT '实体ID',
  `operation`     VARCHAR(8)      NOT NULL                COMMENT '操作：create/update/delete',
  `payload`       JSON            NULL                    COMMENT '变更内容（JSON 字符串）',
  `client_id`     VARCHAR(64)     NOT NULL                COMMENT '发起同步的客户端 ID',
  `synced_at`     BIGINT          NOT NULL                COMMENT '同步时间戳（毫秒）',
  PRIMARY KEY (`id`),
  KEY `idx_user_entity` (`user_id`, `entity_type`, `entity_id`),
  KEY `idx_synced_at` (`synced_at`),
  CONSTRAINT `fk_sync_user`
    FOREIGN KEY (`user_id`) REFERENCES `t_user`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='多端同步日志表（V2.0）';

-- =============================================================================
-- V2.0 表设计完成
-- =============================================================================