package com.expense.tracker.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 登录请求 DTO
 *
 * 与 Node.js 后端的 validateLogin 校验规则保持一致
 */
@Data
public class LoginRequest {

    @NotBlank(message = "请输入用户名 🥺")
    @Size(min = 3, max = 20, message = "用户名长度需在 3-20 位")
    private String username;

    @NotBlank(message = "请输入密码 🔒")
    @Size(min = 6, max = 20, message = "密码长度需在 6-20 位")
    private String password;
}