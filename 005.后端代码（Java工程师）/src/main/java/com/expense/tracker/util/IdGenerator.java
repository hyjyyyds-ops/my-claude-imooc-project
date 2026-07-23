package com.expense.tracker.util;

import java.util.UUID;

/**
 * ID 生成器（与前端 / Node.js 格式保持一致：id_xxxxx_xxxxx）
 */
public class IdGenerator {

    private IdGenerator() {}

    public static String next() {
        return "id_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }

    public static String nextCategoryId() {
        return "cat_custom_" + System.currentTimeMillis();
    }
}