package com.expense.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.expense.tracker.common.BusinessException;
import com.expense.tracker.dto.CategoryVO;
import com.expense.tracker.dto.CreateRecordRequest;
import com.expense.tracker.dto.MonthlyStatsVO;
import com.expense.tracker.dto.RecordVO;
import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.Record;
import com.expense.tracker.entity.User;
import com.expense.tracker.mapper.CategoryMapper;
import com.expense.tracker.mapper.RecordMapper;
import com.expense.tracker.mapper.UserMapper;
import com.expense.tracker.service.RecordService;
import com.expense.tracker.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RecordMapper   recordMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper     userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RecordVO create(String userId, CreateRecordRequest request) {
        // 1. 校验分类存在
        Category cat = categoryMapper.selectById(request.getCategoryId());
        if (cat == null) {
            throw new BusinessException("分类不存在 🥺");
        }

        // 2. 构造记录
        long now = System.currentTimeMillis();
        LocalDate date = request.getDate() != null
                ? LocalDate.parse(request.getDate(), DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now();

        Record record = new Record();
        record.setId(IdGenerator.next());
        record.setUserId(userId);
        record.setAmount(request.getAmount());
        record.setType(1);  // V1.0.1 仅支出
        record.setCategoryId(request.getCategoryId());
        record.setRemark(request.getRemark() == null ? "" : request.getRemark().trim());
        record.setRecordDate(date);
        record.setCreatedAt(now);
        record.setUpdatedAt(now);

        recordMapper.insert(record);

        // 3. 顺手更新用户 streak（如果今天还没记过）
        updateStreakIfNeeded(userId, date);

        log.info("[新增记账] userId={}, amount={}, category={}", userId, record.getAmount(), record.getCategoryId());
        return RecordVO.from(record, cat.getName(), cat.getIcon());
    }

    @Override
    public List<RecordVO> list(String userId, LocalDate startDate, LocalDate endDate, String categoryId) {
        LambdaQueryWrapper<Record> wrapper = new LambdaQueryWrapper<Record>()
                .eq(Record::getUserId, userId)
                .orderByDesc(Record::getRecordDate)
                .orderByDesc(Record::getCreatedAt);

        if (startDate != null && endDate != null) {
            wrapper.between(Record::getRecordDate, startDate, endDate);
        }
        if (categoryId != null && !categoryId.isEmpty() && !"all".equals(categoryId)) {
            wrapper.eq(Record::getCategoryId, categoryId);
        }

        List<Record> records = recordMapper.selectList(wrapper);

        // 批量加载分类信息（避免 N+1）
        Map<String, Category> catMap = loadCategoryMap(records);

        return records.stream()
                .map(r -> {
                    Category c = catMap.get(r.getCategoryId());
                    String name  = c != null ? c.getName()  : "其他";
                    String icon  = c != null ? c.getIcon()  : "📝";
                    return RecordVO.from(r, name, icon);
                })
                .collect(Collectors.toList());
    }

    @Override
    public MonthlyStatsVO stats(String userId, String period) {
        // 1. 计算月份范围
        LocalDate[] range = computeMonthRange(period);
        LocalDate start = range[0];
        LocalDate end   = range[1];

        // 2. 查本月所有记录
        List<Record> records = recordMapper.selectList(
                new LambdaQueryWrapper<Record>()
                        .eq(Record::getUserId, userId)
                        .eq(Record::getType, 1)
                        .between(Record::getRecordDate, start, end));

        // 3. 聚合
        BigDecimal total = records.stream()
                .map(Record::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int days = (int) records.stream().map(Record::getRecordDate).distinct().count();
        int count = records.size();
        BigDecimal dailyAvg = days > 0
                ? total.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 4. 按分类聚合
        Map<String, BigDecimal> byCat = new HashMap<>();
        records.forEach(r -> byCat.merge(r.getCategoryId(), r.getAmount(), BigDecimal::add));

        Map<String, Category> catMap = loadCategoryMap(records);
        List<MonthlyStatsVO.CategoryStat> stats = byCat.entrySet().stream()
                .map(e -> {
                    Category c = catMap.get(e.getKey());
                    int percent = total.compareTo(BigDecimal.ZERO) > 0
                            ? e.getValue().multiply(BigDecimal.valueOf(100))
                                .divide(total, 0, RoundingMode.HALF_UP).intValue()
                            : 0;
                    return MonthlyStatsVO.CategoryStat.builder()
                            .categoryId(e.getKey())
                            .name(c != null ? c.getName() : "其他")
                            .icon(c != null ? c.getIcon() : "📝")
                            .total(e.getValue())
                            .percent(percent)
                            .build();
                })
                .sorted((a, b) -> b.getTotal().compareTo(a.getTotal()))
                .collect(Collectors.toList());

        return MonthlyStatsVO.builder()
                .period(period)
                .total(total)
                .recordDays(days)
                .dailyAvg(dailyAvg)
                .recordCount(count)
                .byCategory(stats)
                .build();
    }

    // ============== 私有方法 ==============

    private Map<String, Category> loadCategoryMap(List<Record> records) {
        if (records.isEmpty()) return new HashMap<>();
        List<String> catIds = records.stream().map(Record::getCategoryId).distinct().collect(Collectors.toList());
        return categoryMapper.selectBatchIds(catIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
    }

    private void updateStreakIfNeeded(String userId, LocalDate date) {
        User user = userMapper.selectById(userId);
        if (user == null) return;

        LocalDate today = LocalDate.now();
        if (!date.equals(today)) return;  // 只在记当天账时更新 streak

        if (today.equals(user.getLastDate())) return;  // 今天已记过

        LocalDate yesterday = today.minusDays(1);
        int newStreak = yesterday.equals(user.getLastDate())
                ? user.getStreak() + 1
                : 1;
        user.setStreak(newStreak);
        user.setLastDate(today);
        user.setUpdatedAt(System.currentTimeMillis());
        userMapper.updateById(user);
    }

    private LocalDate[] computeMonthRange(String period) {
        YearMonth current = YearMonth.now();
        if ("last".equals(period)) {
            YearMonth last = current.minusMonths(1);
            return new LocalDate[]{
                    last.atDay(1),
                    last.atEndOfMonth()
            };
        }
        return new LocalDate[]{
                current.atDay(1),
                current.atEndOfMonth()
        };
    }
}