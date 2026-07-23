package com.expense.tracker.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 月度统计 VO
 */
@Data
@Builder
public class MonthlyStatsVO {

    private String  period;             // "current" | "last"
    private BigDecimal total;
    private Integer recordDays;
    private BigDecimal dailyAvg;
    private Integer recordCount;
    private List<CategoryStat> byCategory;

    @Data
    @Builder
    public static class CategoryStat {
        private String  categoryId;
        private String  name;
        private String  icon;
        private BigDecimal total;
        private Integer percent;
    }
}