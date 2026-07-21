/**
 * validators.js - 入参校验（与 V1.0.1 PRD 规则一致）
 */
export const RULES = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 20,
};

export function validateRegister(body) {
  const { username, password, confirmPassword } = body || {};
  const u = (username || '').trim();

  if (!u)                              return { ok: false, message: '请输入用户名 🥺' };
  if (u.length < RULES.USERNAME_MIN)   return { ok: false, message: '用户名至少 3 位哦~' };
  if (u.length > RULES.USERNAME_MAX)   return { ok: false, message: '用户名最多 20 位~' };

  if (!password)                       return { ok: false, message: '请输入密码 🔒' };
  if (password.length < RULES.PASSWORD_MIN) return { ok: false, message: '密码至少 6 位~' };
  if (password.length > RULES.PASSWORD_MAX) return { ok: false, message: '密码最多 20 位~' };

  if (!confirmPassword)                return { ok: false, message: '请再输入一次密码 🔐' };
  if (password !== confirmPassword)    return { ok: false, message: '两次密码不一样，再试试？' };

  return { ok: true, username: u, password };
}

export function validateLogin(body) {
  const { username, password } = body || {};
  const u = (username || '').trim();

  if (!u)        return { ok: false, message: '请输入用户名 🥺' };
  if (!password) return { ok: false, message: '请输入密码 🔒' };

  return { ok: true, username: u, password };
}
