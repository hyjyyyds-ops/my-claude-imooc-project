package com.expense.tracker.service;

import com.expense.tracker.dto.AuthResponse;
import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.dto.UserVO;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 注册
     */
    AuthResponse register(RegisterRequest request);

    /**
     * 登录
     */
    AuthResponse login(LoginRequest request);

    /**
     * 获取当前用户信息
     */
    UserVO getCurrentUser(String userId);
}