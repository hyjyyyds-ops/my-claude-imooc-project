package com.expense.tracker.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 创建记账请求 DTO
 *
 * 与前端 BillModule.addRecord 参数对齐
 */
@Data
public class CreateRecordRequest {

    @NotNull(message = "请输入金额 🥺")
    @DecimalMin(value = "0.01", message = "金额必须大于 0")
    private BigDecimal amount;

    @NotBlank(message = "请选择分类")
    private String categoryId;

    @Size(max = 50, message = "备注最多 50 字")
    private String remark;

    /** 可选，默认今天（YYYY-MM-DD） */
    private String date;
}