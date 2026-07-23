package com.expense.tracker.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 创建分类请求 DTO
 */
@Data
public class CreateCategoryRequest {

    @NotBlank(message = "请输入分类名称 🥺")
    @Size(max = 20, message = "分类名称最多 20 个字")
    private String name;

    @NotBlank(message = "请选择一个图标")
    @Size(max = 16, message = "图标字段过长")
    private String icon;
}