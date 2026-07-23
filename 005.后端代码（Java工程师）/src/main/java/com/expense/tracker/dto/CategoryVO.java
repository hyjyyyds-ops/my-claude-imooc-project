package com.expense.tracker.dto;

import com.expense.tracker.entity.Category;
import lombok.Builder;
import lombok.Data;

/**
 * 分类视图对象
 */
@Data
@Builder
public class CategoryVO {

    private String  id;
    private String  name;
    private String  icon;
    private Integer type;
    private Integer isCustom;

    public static CategoryVO fromEntity(Category c) {
        if (c == null) return null;
        return CategoryVO.builder()
                .id(c.getId())
                .name(c.getName())
                .icon(c.getIcon())
                .type(c.getType())
                .isCustom(c.getIsCustom())
                .build();
    }
}