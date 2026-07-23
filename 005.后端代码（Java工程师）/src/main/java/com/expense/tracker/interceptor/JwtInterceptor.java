package com.expense.tracker.interceptor;

import com.expense.tracker.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * JWT 拦截器
 *
 * 从 Authorization 头解析 JWT，把用户信息塞到 request attribute 中供后续使用
 */
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public static final String USER_ID_ATTR   = "currentUserId";
    public static final String USERNAME_ATTR  = "currentUsername";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // OPTIONS 预检请求直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String token = jwtUtil.extractToken(request.getHeader("Authorization"));
        if (token == null) {
            response.setStatus(401);
            return false;
        }

        Claims claims = jwtUtil.parse(token);
        if (claims == null) {
            response.setStatus(401);
            return false;
        }

        // 把用户信息注入到 request attribute，Controller 可通过 @RequestAttribute 获取
        request.setAttribute(USER_ID_ATTR,  claims.get("id"));
        request.setAttribute(USERNAME_ATTR, claims.get("username"));
        return true;
    }
}