package com.expense.tracker.controller;

import com.expense.tracker.common.Result;
import com.expense.tracker.dto.CategoryVO;
import com.expense.tracker.dto.CreateCategoryRequest;
import com.expense.tracker.interceptor.JwtInterceptor;
import com.expense.tracker.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

/**
 * 分类控制器
 *
 * URL: /api/categories/*
 */
@Slf4j
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "03. 分类模块", description = "消费分类的增删改查")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "获取当前用户的所有分类")
    @GetMapping
    public Result<List<CategoryVO>> list(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId) {
        List<CategoryVO> categories = categoryService.listByUser(userId);
        return Result.success(categories);
    }

    @Operation(summary = "新增自定义分类")
    @PostMapping
    public Result<CategoryVO> create(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId,
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryVO vo = categoryService.create(userId, request);
        return Result.success("分类添加成功 ✨", vo);
    }

    @Operation(summary = "删除自定义分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId,
            @PathVariable("id") String id) {
        categoryService.delete(userId, id);
        return Result.success();
    }
}