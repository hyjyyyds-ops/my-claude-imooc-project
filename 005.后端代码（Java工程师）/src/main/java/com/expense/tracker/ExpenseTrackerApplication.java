package com.expense.tracker;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 每日消费记录助手 - Spring Boot 启动类
 *
 * 启动后访问：
 *   - API:    http://localhost:8080/api/...
 *   - 文档:   http://localhost:8080/swagger-ui.html
 */
@SpringBootApplication
@MapperScan("com.expense.tracker.mapper")
public class ExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("🚀 每日记账后端启动成功");
        System.out.println("📡 API 文档: http://localhost:8080/swagger-ui.html");
        System.out.println("========================================\n");
    }
}