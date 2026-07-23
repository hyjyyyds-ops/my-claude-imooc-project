package com.expense.tracker.controller;

import com.expense.tracker.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 *
 * URL: /api/health
 *
 * 与 Node.js 后端 /api/health 响应格式保持一致
 */
@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Tag(name = "00. 系统", description = "健康检查")
public class HealthController {

    private final DataSource dataSource;

    @Operation(summary = "健康检查", description = "返回服务状态 + 数据库连通性")
    @GetMapping
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("service", "expense-tracker-backend-java");
        data.put("version", "1.0.1");

        // 测试数据库连通性
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(2);
            data.put("db", valid ? "up" : "down");
        } catch (Exception e) {
            log.warn("[健康检查] 数据库连接失败", e);
            data.put("db", "down");
            data.put("error", e.getMessage());
        }

        return Result.success(data);
    }
}