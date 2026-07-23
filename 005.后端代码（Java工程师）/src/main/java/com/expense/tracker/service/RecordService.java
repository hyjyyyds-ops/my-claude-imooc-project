package com.expense.tracker.service;

import com.expense.tracker.dto.CreateRecordRequest;
import com.expense.tracker.dto.MonthlyStatsVO;
import com.expense.tracker.dto.RecordVO;

import java.time.LocalDate;
import java.util.List;

/**
 * 记账服务接口
 */
public interface RecordService {

    /**
     * 新增记账
     */
    RecordVO create(String userId, CreateRecordRequest request);

    /**
     * 查询用户的记账列表（支持按日期范围和分类筛选）
     */
    List<RecordVO> list(String userId, LocalDate startDate, LocalDate endDate, String categoryId);

    /**
     * 月度统计
     *
     * @param period "current" | "last"
     */
    MonthlyStatsVO stats(String userId, String period);
}