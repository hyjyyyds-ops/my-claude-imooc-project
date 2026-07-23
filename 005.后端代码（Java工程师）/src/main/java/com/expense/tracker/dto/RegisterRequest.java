package com.expense.tracker.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 注册请求 DTO
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "请输入用户名 🥺")
    @Size(min = 3, max = 20, message = "用户名至少 3 位哦~")
    private String username;

    @NotBlank(message = "请输入密码 🔒")
    @Size(min = 6, max = 20, message = "密码至少 6 位~")
    private String password;

    @NotBlank(message = "请再输入一次密码 🔐")
    private String confirmPassword;
}