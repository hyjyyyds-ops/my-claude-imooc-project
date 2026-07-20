/**
 * constants.js
 * --------------------------------------------------------------------------
 * 每日记账 V1.0.1 - 全局常量定义
 *
 * 集中管理:
 *   - localStorage 键名（避免散落各处）
 *   - 系统预设分类
 *   - 表情图标选项
 *   - 页面/标签路由常量
 * --------------------------------------------------------------------------
 */

const STORAGE_KEYS = {
  USERS:          "expense_users_v1",        // 所有注册用户
  CURRENT_USER:   "expense_current_user_v1", // 当前登录用户 ID
  RECORDS:        "expense_records_v1",      // 消费记录（含 userId）
  CATEGORIES:     "expense_categories_v1",   // 自定义分类（含 userId）
  STREAK_MAP:     "expense_streak_map_v1",   // { [userId]: { streak, lastDate } }
  AVATARS:        "expense_avatars_v1",      // { [userId]: "data:image/...;base64,..." }
};

const ROUTES = {
  LOGIN:    "login",
  REGISTER: "register",
  RECORD:   "record",   // 记账（首页）
  DETAIL:   "detail",   // 明细
  STATS:    "stats",    // 统计
  PROFILE:  "profile",  // 我的
};

/**
 * 系统预设分类（所有用户共享，不绑定 userId）
 * 自定义分类会附加 userId 字段以实现数据隔离
 */
const DEFAULT_CATEGORIES = [
  { id: "cat_dining",        name: "餐饮",   icon: "🍔", isCustom: false },
  { id: "cat_traffic",       name: "交通",   icon: "🚗", isCustom: false },
  { id: "cat_shopping",      name: "购物",   icon: "🛍️", isCustom: false },
  { id: "cat_entertainment", name: "娱乐",   icon: "🎬", isCustom: false },
  { id: "cat_living",        name: "居住",   icon: "🏠", isCustom: false },
  { id: "cat_medical",       name: "医疗",   icon: "💊", isCustom: false },
  { id: "cat_study",         name: "学习",   icon: "📚", isCustom: false },
  { id: "cat_other",         name: "其他",   icon: "📝", isCustom: false },
];

/**
 * 自定义分类可选的表情图标
 */
const EMOJI_OPTIONS = [
  "🛍️", "🎮", "☕", "🍦", "🎁", "🐱", "🐶",
  "🌸", "🍀", "⭐", "🎵", "📷", "💄", "👗", "🎓", "💰",
];

/**
 * 校验规则 - 用于注册/登录表单
 */
const VALIDATION = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 20,
};