package com.expense.tracker.controller;

import com.expense.tracker.common.Result;
import com.expense.tracker.dto.CreateRecordRequest;
import com.expense.tracker.dto.MonthlyStatsVO;
import com.expense.tracker.dto.RecordVO;
import com.expense.tracker.interceptor.JwtInterceptor;
import com.expense.tracker.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

/**
 * 记账控制器
 *
 * URL: /api/records/*
 */
@Slf4j
@RestController
@RequestMapping("/records")
@RequiredArgsConstructor
@Tag(name = "02. 记账模块", description = "消费记录的增删改查与统计")
public class RecordController {

    private final RecordService recordService;

    @Operation(summary = "新增一条记账")
    @PostMapping
    public Result<RecordVO> create(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId,
            @Valid @RequestBody CreateRecordRequest request) {
        RecordVO vo = recordService.create(userId, request);
        return Result.success("记账成功 ✨", vo);
    }

    @Operation(summary = "查询当前用户的记账列表")
    @GetMapping
    public Result<List<RecordVO>> list(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String categoryId) {
        List<RecordVO> list = recordService.list(userId, startDate, endDate, categoryId);
        return Result.success(list);
    }

    @Operation(summary = "月度统计", description = "period: current=本月, last=上月")
    @GetMapping("/stats")
    public Result<MonthlyStatsVO> stats(
            @Parameter(hidden = true) @RequestAttribute(JwtInterceptor.USER_ID_ATTR) String userId,
            @RequestParam(defaultValue = "current") String period) {
        MonthlyStatsVO stats = recordService.stats(userId, period);
        return Result.success(stats);
    }
}