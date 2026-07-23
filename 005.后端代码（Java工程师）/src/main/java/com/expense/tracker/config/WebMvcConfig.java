package com.expense.tracker.config;

import com.expense.tracker.interceptor.JwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 配置：注册拦截器
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 需要鉴权的路径
                .addPathPatterns(
                        "/records/**",
                        "/categories/**",
                        "/users/**"
                )
                // 放行的路径（无需 token）
                .excludePathPatterns(
                        "/auth/register",
                        "/auth/login",
                        "/health",
                        "/hello/**",
                        "/swagger-ui/**",
                        "/swagger-resources/**",
                        "/v3/api-docs/**",
                        "/error"
                );
    }
}