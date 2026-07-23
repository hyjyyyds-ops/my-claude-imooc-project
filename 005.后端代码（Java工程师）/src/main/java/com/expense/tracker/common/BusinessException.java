package com.expense.tracker.common;

import lombok.Getter;

/**
 * 业务异常（可被全局异常处理器捕获并返回友好提示）
 */
@Getter
public class BusinessException extends RuntimeException {

    private final Integer code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    /**
     * 带自定义错误码的业务异常
     */
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}