package com.expense.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 认证响应（注册 / 登录）
 *
 * 与 Node.js 后端格式保持完全一致（user 和 token 在顶层）：
 *   {
 *     "success": true,
 *     "message": "登录成功 ✨",
 *     "user": { ... },
 *     "token": "eyJ..."
 *   }
 *
 * 注意：本类不使用 Result 包装，因为 Node.js 版本就没有 data 字段
 */
@Data
@AllArgsConstructor
public class AuthResponse {

    private Boolean success;
    private String  message;
    private UserVO  user;
    private String  token;

    public static AuthResponse success(String message, UserVO user, String token) {
        return new AuthResponse(true, message, user, token);
    }
}