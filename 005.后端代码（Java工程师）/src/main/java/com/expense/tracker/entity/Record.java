package com.expense.tracker.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 消费记录实体
 *
 * 对应数据库表：t_record
 */
@Data
@TableName("t_record")
public class Record implements Serializable {

    /** 主键 UUID */
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    /** 所属用户 ID */
    @TableField("user_id")
    private String userId;

    /** 金额（单位：元，DECIMAL(10,2)） */
    private BigDecimal amount;

    /** 类型：1=支出，2=收入 */
    private Integer type;

    /** 分类 ID */
    @TableField("category_id")
    private String categoryId;

    /** 备注（最大 50 字符） */
    private String remark;

    /** 记账日期（YYYY-MM-DD） */
    @TableField("record_date")
    private LocalDate recordDate;

    /** 创建时间戳（毫秒） */
    @TableField("created_at")
    private Long createdAt;

    /** 更新时间戳（毫秒） */
    @TableField("updated_at")
    private Long updatedAt;
}