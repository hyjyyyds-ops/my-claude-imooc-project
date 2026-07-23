package com.expense.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.expense.tracker.common.BusinessException;
import com.expense.tracker.dto.AuthResponse;
import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.dto.UserVO;
import com.expense.tracker.entity.User;
import com.expense.tracker.mapper.UserMapper;
import com.expense.tracker.service.UserService;
import com.expense.tracker.util.IdGenerator;
import com.expense.tracker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper        userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil           jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();

        // 1. 二次校验密码一致性（前端已校验，这里防御性）
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("两次密码不一样，再试试？");
        }

        // 2. 检查用户名是否已存在
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (count != null && count > 0) {
            throw new BusinessException("该用户名已被注册，换一个试试？");
        }

        // 3. 哈希密码
        String hash = passwordEncoder.encode(request.getPassword());

        // 4. 构造实体入库
        long now = System.currentTimeMillis();
        User user = new User();
        user.setId(IdGenerator.next());
        user.setUsername(username);
        user.setPasswordHash(hash);
        user.setStreak(0);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        userMapper.insert(user);
        log.info("[用户注册] id={}, username={}", user.getId(), user.getUsername());

        // 5. 返回结果
        String token = jwtUtil.generate(user.getId(), user.getUsername());
        return AuthResponse.success("注册成功 ✨", UserVO.fromEntity(user), token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername().trim();

        // 1. 查询用户
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new BusinessException("该用户不存在，先注册一下吧~");
        }

        // 2. 校验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("密码错了，再试一次？ 🥺");
        }

        // 3. 签发 token
        String token = jwtUtil.generate(user.getId(), user.getUsername());
        log.info("[用户登录] id={}, username={}", user.getId(), user.getUsername());

        return AuthResponse.success("登录成功 ✨", UserVO.fromEntity(user), token);
    }

    @Override
    public UserVO getCurrentUser(String userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return UserVO.fromEntity(user);
    }
}