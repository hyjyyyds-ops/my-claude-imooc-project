package com.expense.tracker.dto;

import com.expense.tracker.entity.Record;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 消费记录视图对象（含分类信息）
 */
@Data
@Builder
public class RecordVO {

    private String    id;
    private String    categoryId;
    private String    categoryName;
    private String    categoryIcon;
    private BigDecimal amount;
    private Integer   type;
    private String    remark;
    private String    date;
    private Long      createdAt;

    public static RecordVO from(Record r, String catName, String catIcon) {
        if (r == null) return null;
        return RecordVO.builder()
                .id(r.getId())
                .categoryId(r.getCategoryId())
                .categoryName(catName)
                .categoryIcon(catIcon)
                .amount(r.getAmount())
                .type(r.getType())
                .remark(r.getRemark())
                .date(r.getRecordDate() != null ? r.getRecordDate().toString() : null)
                .createdAt(r.getCreatedAt())
                .build();
    }
}