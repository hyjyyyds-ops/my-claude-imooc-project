package com.expense.tracker.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应包装
 *
 * 与 Node.js 后端的响应格式保持一致：
 *   { "success": true, "message": "...", "data": {...} }
 */
@Data
public class Result<T> implements Serializable {

    private Boolean success;
    private String  message;
    private T       data;

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        return success("操作成功 ✨", data);
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> r = new Result<>();
        r.success = true;
        r.message = message;
        r.data = data;
        return r;
    }

    public static <T> Result<T> error(String message) {
        return error(ResultCode.BAD_REQUEST, message);
    }

    public static <T> Result<T> error(ResultCode code, String message) {
        Result<T> r = new Result<>();
        r.success = false;
        r.message = message;
        r.data = null;
        return r;
    }
}