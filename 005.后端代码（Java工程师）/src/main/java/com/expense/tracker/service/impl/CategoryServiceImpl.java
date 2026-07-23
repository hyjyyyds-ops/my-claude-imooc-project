package com.expense.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.expense.tracker.common.BusinessException;
import com.expense.tracker.dto.CategoryVO;
import com.expense.tracker.dto.CreateCategoryRequest;
import com.expense.tracker.entity.Category;
import com.expense.tracker.mapper.CategoryMapper;
import com.expense.tracker.service.CategoryService;
import com.expense.tracker.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryVO> listByUser(String userId) {
        // 1. 系统预设分类（user_id IS NULL）
        List<Category> defaults = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().isNull(Category::getUserId));

        // 2. 当前用户的自定义分类
        List<Category> customs = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                        .eq(Category::getUserId, userId)
                        .eq(Category::getIsCustom, 1));

        // 3. 合并：系统在前，自定义在后
        return Stream.concat(defaults.stream(), customs.stream())
                .map(CategoryVO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryVO create(String userId, CreateCategoryRequest request) {
        Category c = new Category();
        c.setId(IdGenerator.nextCategoryId());
        c.setUserId(userId);
        c.setName(request.getName().trim());
        c.setIcon(request.getIcon());
        c.setType(1);  // V1.0.1 仅支出
        c.setIsCustom(1);
        c.setSortOrder(99);
        c.setCreatedAt(System.currentTimeMillis());

        categoryMapper.insert(c);
        log.info("[新增分类] userId={}, id={}, name={}", userId, c.getId(), c.getName());
        return CategoryVO.fromEntity(c);
    }

    @Override
    public void delete(String userId, String categoryId) {
        // 校验：必须是当前用户的自定义分类
        Category c = categoryMapper.selectById(categoryId);
        if (c == null) {
            throw new BusinessException("分类不存在 🥺");
        }
        if (!userId.equals(c.getUserId()) || c.getIsCustom() != 1) {
            throw new BusinessException("系统预设分类不可删除 🥺");
        }

        categoryMapper.deleteById(categoryId);
        log.info("[删除分类] userId={}, id={}", userId, categoryId);
    }
}