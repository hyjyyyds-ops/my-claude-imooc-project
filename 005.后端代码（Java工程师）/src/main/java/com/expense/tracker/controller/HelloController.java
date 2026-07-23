package com.expense.tracker.controller;

import com.expense.tracker.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Hello World 控制器 - 用于验证服务启动正常
 *
 * 访问地址（无需鉴权）：
 *   - http://localhost:8080/api/hello
 *   - http://localhost:8080/api/hello/info
 *
 * 浏览器直接打开即可看到 JSON 响应
 */
@Slf4j
@RestController
@RequestMapping("/hello")
@Tag(name = "00. Hello", description = "服务健康与示例接口")
public class HelloController {

    @GetMapping
    @Operation(summary = "最简单的 Hello World", description = "返回欢迎信息和服务运行状态")
    public Result<Map<String, Object>> hello() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Hello World 🐱 每日记账后端运行正常 ✨");
        data.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        data.put("service", "expense-tracker-backend");
        data.put("version", "1.0.1");

        log.info("[hello] 收到访问请求");
        return Result.success("OK", data);
    }

    /**
     * 健康检查（与 Spring Actuator 解耦，简单返回即可）
     */
    @GetMapping("/info")
    @Operation(summary = "服务详细信息", description = "返回运行环境的元信息")
    public Result<Map<String, Object>> info() {
        Map<String, Object> data = new HashMap<>();
        data.put("javaVersion", System.getProperty("java.version"));
        data.put("osName", System.getProperty("os.name"));
        data.put("osVersion", System.getProperty("os.version"));
        data.put("userDir", System.getProperty("user.dir"));
        data.put("now", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return Result.success(data);
    }
}