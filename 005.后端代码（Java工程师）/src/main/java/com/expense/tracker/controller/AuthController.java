package com.expense.tracker.controller;

import com.expense.tracker.dto.AuthResponse;
import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

/**
 * 认证控制器 - 注册 / 登录
 *
 * URL: /api/auth/*
 *
 * 响应格式与 Node.js 后端保持完全一致（user、token 在顶层，不使用 Result 包装）：
 *   { "success": true, "message": "...", "user": {...}, "token": "..." }
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "01. 认证模块", description = "注册 / 登录")
public class AuthController {

    private final UserService userService;

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        log.info("[POST /auth/register] username={}", request.getUsername());
        return userService.register(request);
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        log.info("[POST /auth/login] username={}", request.getUsername());
        return userService.login(request);
    }
}