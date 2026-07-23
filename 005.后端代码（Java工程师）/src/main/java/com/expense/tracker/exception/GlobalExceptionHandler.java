package com.expense.tracker.exception;

import com.expense.tracker.common.BusinessException;
import com.expense.tracker.common.Result;
import com.expense.tracker.common.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理
 *
 * 统一返回 { "success": false, "message": "..." } 格式
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常 */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("[业务异常] {}", e.getMessage());
        return Result.error(ResultCode.BAD_REQUEST, e.getMessage());
    }

    /** @Valid 校验失败（@RequestBody） */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        FieldError fe = e.getBindingResult().getFieldError();
        String msg = fe != null ? fe.getDefaultMessage() : "请求参数无效";
        log.warn("[参数校验] {}", msg);
        return Result.error(ResultCode.BAD_REQUEST, msg);
    }

    /** 表单绑定校验失败 */
    @ExceptionHandler(BindException.class)
    public Result<Void> handleBind(BindException e) {
        FieldError fe = e.getBindingResult().getFieldError();
        String msg = fe != null ? fe.getDefaultMessage() : "请求参数无效";
        return Result.error(ResultCode.BAD_REQUEST, msg);
    }

    /** 兜底异常 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleAll(Exception e) {
        log.error("[系统异常]", e);
        return Result.error(ResultCode.INTERNAL_ERROR, "服务器开小差啦，请稍后再试 🥺");
    }
}