package com.expense.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.expense.tracker.entity.Record;
import org.apache.ibatis.annotations.Mapper;

/**
 * 消费记录 Mapper
 */
@Mapper
public interface RecordMapper extends BaseMapper<Record> {
}