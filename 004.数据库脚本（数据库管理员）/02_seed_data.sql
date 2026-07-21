-- =============================================================================
-- 每日消费记录助手 - 种子数据
-- 版本: V1.0.1
-- 说明: 初始化 8 个系统预设分类（所有用户共享）
-- =============================================================================

USE `expense_tracker`;

-- -----------------------------------------------------------------------------
-- 系统预设分类
--   - user_id = NULL 表示系统级，所有用户共享
--   - is_custom = 0 表示系统预设
--   - sort_order 用于前端展示顺序
-- -----------------------------------------------------------------------------
INSERT INTO `t_category`
  (`id`, `user_id`, `name`, `icon`, `type`, `is_custom`, `sort_order`, `created_at`)
VALUES
  ('cat_dining',        NULL, '餐饮', '🍔', 1, 0, 1, UNIX_TIMESTAMP() * 1000),
  ('cat_traffic',       NULL, '交通', '🚗', 1, 0, 2, UNIX_TIMESTAMP() * 1000),
  ('cat_shopping',      NULL, '购物', '🛍️', 1, 0, 3, UNIX_TIMESTAMP() * 1000),
  ('cat_entertainment', NULL, '娱乐', '🎬', 1, 0, 4, UNIX_TIMESTAMP() * 1000),
  ('cat_living',        NULL, '居住', '🏠', 1, 0, 5, UNIX_TIMESTAMP() * 1000),
  ('cat_medical',       NULL, '医疗', '💊', 1, 0, 6, UNIX_TIMESTAMP() * 1000),
  ('cat_study',         NULL, '学习', '📚', 1, 0, 7, UNIX_TIMESTAMP() * 1000),
  ('cat_other',         NULL, '其他', '📝', 1, 0, 8, UNIX_TIMESTAMP() * 1000);

-- =============================================================================
-- 验证
-- =============================================================================
SELECT
  `id`,
  `name`,
  `icon`,
  CASE `type` WHEN 1 THEN '支出' WHEN 2 THEN '收入' END AS `type_name`,
  CASE `is_custom` WHEN 0 THEN '系统' WHEN 1 THEN '自定义' END AS `source`,
  `sort_order`
FROM `t_category`
ORDER BY `sort_order`;