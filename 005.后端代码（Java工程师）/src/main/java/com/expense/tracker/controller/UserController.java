package com.expense.tracker.controller;

import com.expense.tracker.common.Result;
import com.expense.tracker.dto.UserVO;
import com.expense.tracker.interceptor.JwtInterceptor;
import com.expense.tracker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户控制器 - 获取当前用户信息
 *
 * URL: /api/users/*
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "04. 用户模块", description = "当前用户信息查询")
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取当前登录用户的信息")
    @GetMapping("/me")
    public Result<UserVO> me(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId) {
        UserVO vo = userService.getCurrentUser(userId);
        return Result.success(vo);
    }
}