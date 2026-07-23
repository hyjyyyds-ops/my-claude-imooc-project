package com.expense.tracker.service;

import com.expense.tracker.dto.CategoryVO;
import com.expense.tracker.dto.CreateCategoryRequest;

import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService {

    /**
     * 获取某用户的所有分类（系统预设 + 自定义）
     */
    List<CategoryVO> listByUser(String userId);

    /**
     * 新增自定义分类
     */
    CategoryVO create(String userId, CreateCategoryRequest request);

    /**
     * 删除自定义分类（系统预设不可删）
     */
    void delete(String userId, String categoryId);
}