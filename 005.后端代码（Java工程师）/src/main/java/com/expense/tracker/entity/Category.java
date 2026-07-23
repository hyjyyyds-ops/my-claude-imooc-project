package com.expense.tracker.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * 消费分类实体
 *
 * 对应数据库表：t_category
 *
 * 系统预设分类：userId = null，所有用户共享
 * 自定义分类：   userId = <UUID>，归属特定用户
 */
@Data
@TableName("t_category")
public class Category implements Serializable {

    /** 主键：系统 "cat_xxx"，自定义 "cat_custom_xxx" */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /** 所属用户 ID（系统预设为 null） */
    @TableField("user_id")
    private String userId;

    /** 分类名称 */
    private String name;

    /** 图标（Emoji 字符串） */
    private String icon;

    /** 类型：1=支出，2=收入（V2.0 预留） */
    private Integer type;

    /** 是否自定义：0=系统预设，1=用户自定义 */
    @TableField("is_custom")
    private Integer isCustom;

    /** 排序权重（值越小越靠前） */
    @TableField("sort_order")
    private Integer sortOrder;

    /** 创建时间戳（毫秒） */
    @TableField("created_at")
    private Long createdAt;
}