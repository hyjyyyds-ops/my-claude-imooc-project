-- =============================================================================
-- 每日消费记录助手 - 示例查询
-- 版本: V1.0.1
-- 说明: 覆盖 V1.0.1 各业务模块的常用 SQL（含参数占位符 ?）
-- =============================================================================

USE `expense_tracker`;

-- -----------------------------------------------------------------------------
-- 1. 用户模块
-- -----------------------------------------------------------------------------

-- 1.1 检查用户名是否已存在（注册时实时校验）
SELECT COUNT(*) AS exists_count
FROM `t_user`
WHERE `username` = ?;

-- 1.2 用户登录验证
SELECT `id`, `username`, `password_hash`, `avatar`, `streak`
FROM `t_user`
WHERE `username` = ?;

-- 1.3 更新最后记账日期和连续天数
UPDATE `t_user`
SET
  `streak`    = ?,
  `last_date` = ?,
  `updated_at` = UNIX_TIMESTAMP() * 1000
WHERE `id` = ?;

-- 1.4 更新用户头像
UPDATE `t_user`
SET `avatar` = ?, `updated_at` = UNIX_TIMESTAMP() * 1000
WHERE `id` = ?;


-- -----------------------------------------------------------------------------
-- 2. 分类模块
-- -----------------------------------------------------------------------------

-- 2.1 获取某用户的所有分类（系统预设 + 自定义）
SELECT `id`, `name`, `icon`, `type`, `is_custom`, `sort_order`
FROM `t_category`
WHERE (`user_id` = ? OR `user_id` IS NULL)
  AND `type` = 1
ORDER BY `is_custom` ASC, `sort_order` ASC;

-- 2.2 新增自定义分类
INSERT INTO `t_category`
  (`id`, `user_id`, `name`, `icon`, `type`, `is_custom`, `sort_order`, `created_at`)
VALUES
  (CONCAT('cat_custom_', UNIX_TIMESTAMP()), ?, ?, ?, 1, 1, 99, UNIX_TIMESTAMP() * 1000);

-- 2.3 删除自定义分类（系统预设为 NULL 不会匹配，天然保护）
DELETE FROM `t_category`
WHERE `id` = ? AND `user_id` = ? AND `is_custom` = 1;


-- -----------------------------------------------------------------------------
-- 3. 消费记录模块
-- -----------------------------------------------------------------------------

-- 3.1 新增一条消费记录
INSERT INTO `t_record`
  (`id`, `user_id`, `amount`, `type`, `category_id`, `remark`, `record_date`, `created_at`, `updated_at`)
VALUES
  (?, ?, ?, 1, ?, ?, ?, ?, ?);

-- 3.2 删除记录（带用户校验）
DELETE FROM `t_record`
WHERE `id` = ? AND `user_id` = ?;

-- 3.3 更新记录
UPDATE `t_record`
SET
  `amount`      = ?,
  `category_id` = ?,
  `remark`      = ?,
  `record_date` = ?,
  `updated_at`  = UNIX_TIMESTAMP() * 1000
WHERE `id` = ? AND `user_id` = ?;


-- -----------------------------------------------------------------------------
-- 4. 账单列表（明细页）
-- -----------------------------------------------------------------------------

-- 4.1 按日期倒序分页查询
SELECT
  r.`id`,
  r.`amount`,
  r.`remark`,
  r.`record_date`,
  r.`created_at`,
  c.`name` AS `category_name`,
  c.`icon` AS `category_icon`
FROM `t_record` r
INNER JOIN `t_category` c ON r.`category_id` = c.`id`
WHERE r.`user_id` = ?
  AND r.`type` = 1
ORDER BY r.`record_date` DESC, r.`created_at` DESC
LIMIT ? OFFSET ?;

-- 4.2 按日期分组（带每日小计）
SELECT
  `record_date`,
  SUM(`amount`) AS `day_total`,
  COUNT(*)      AS `day_count`
FROM `t_record`
WHERE `user_id` = ? AND `type` = 1
  AND `record_date` BETWEEN ? AND ?
GROUP BY `record_date`
ORDER BY `record_date` DESC;

-- 4.3 按分类筛选
SELECT r.*, c.`name` AS `category_name`, c.`icon` AS `category_icon`
FROM `t_record` r
INNER JOIN `t_category` c ON r.`category_id` = c.`id`
WHERE r.`user_id` = ? AND r.`category_id` = ?
  AND r.`type` = 1
ORDER BY r.`record_date` DESC, r.`created_at` DESC;


-- -----------------------------------------------------------------------------
-- 5. 统计模块
-- -----------------------------------------------------------------------------

-- 5.1 本月总览卡片
SELECT
  COALESCE(SUM(`amount`), 0)               AS `total_amount`,
  COUNT(DISTINCT `record_date`)            AS `record_days`,
  ROUND(COALESCE(SUM(`amount`), 0)
        / GREATEST(COUNT(DISTINCT `record_date`), 1), 2) AS `avg_per_day`
FROM `t_record`
WHERE `user_id` = ? AND `type` = 1
  AND `record_date` BETWEEN ? AND ?;

-- 5.2 分类占比（甜甜圈图）
SELECT
  c.`id`,
  c.`name`,
  c.`icon`,
  SUM(r.`amount`) AS `total`,
  ROUND(SUM(r.`amount`) * 100.0
        / NULLIF((SELECT SUM(`amount`) FROM `t_record`
                  WHERE `user_id` = ? AND `type` = 1
                    AND `record_date` BETWEEN ? AND ?), 0), 2) AS `percent`
FROM `t_record` r
INNER JOIN `t_category` c ON r.`category_id` = c.`id`
WHERE r.`user_id` = ? AND r.`type` = 1
  AND r.`record_date` BETWEEN ? AND ?
GROUP BY c.`id`, c.`name`, c.`icon`
ORDER BY `total` DESC;

-- 5.3 支出排行榜
SELECT
  c.`name`,
  c.`icon`,
  SUM(r.`amount`) AS `total`,
  COUNT(*)        AS `cnt`
FROM `t_record` r
INNER JOIN `t_category` c ON r.`category_id` = c.`id`
WHERE r.`user_id` = ? AND r.`type` = 1
  AND r.`record_date` BETWEEN ? AND ?
GROUP BY c.`id`, c.`name`, c.`icon`
ORDER BY `total` DESC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 6. 数据管理
-- -----------------------------------------------------------------------------

-- 6.1 清空当前用户所有记录（保留用户和分类）
DELETE FROM `t_record` WHERE `user_id` = ?;

-- 6.2 清空当前用户的所有数据（含自定义分类）
DELETE FROM `t_category` WHERE `user_id` = ? AND `is_custom` = 1;
DELETE FROM `t_record` WHERE `user_id` = ?;

-- 6.3 导出当前用户所有数据（JSON 结构）
SELECT
  JSON_OBJECT(
    'version',    '1.0.1',
    'exportDate', NOW(),
    'username',   (SELECT `username` FROM `t_user` WHERE `id` = ?),
    'records',    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id',         r.`id`,
        'amount',     r.`amount`,
        'type',       r.`type`,
        'categoryId', r.`category_id`,
        'remark',     r.`remark`,
        'date',       DATE_FORMAT(r.`record_date`, '%Y-%m-%d'),
        'createdAt',  r.`created_at`,
        'updatedAt',  r.`updated_at`
      )
    )
  ) AS `backup_json`
FROM `t_record` r
WHERE r.`user_id` = ?;

-- =============================================================================
-- 完成
-- =============================================================================