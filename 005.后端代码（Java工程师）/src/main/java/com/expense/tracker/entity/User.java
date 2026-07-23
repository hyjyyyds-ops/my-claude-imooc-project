package com.expense.tracker.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * 用户实体
 *
 * 对应数据库表：t_user
 * Schema 见 004.数据库脚本/01_schema.sql
 */
@Data
@TableName("t_user")
public class User implements Serializable {

    /** 主键 UUID（与前端 id_xxx 格式保持一致） */
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    /** 用户名（3-20 位，唯一） */
    private String username;

    /** 密码 bcrypt 哈希（60 字符） */
    @TableField("password_hash")
    private String passwordHash;

    /** 头像 Base64（MEDIUMTEXT，可为空） */
    private String avatar;

    /** 连续记账天数 */
    private Integer streak;

    /** 最后记账日期（YYYY-MM-DD） */
    @TableField("last_date")
    private LocalDate lastDate;

    /** 创建时间戳（毫秒） */
    @TableField("created_at")
    private Long createdAt;

    /** 更新时间戳（毫秒） */
    @TableField("updated_at")
    private Long updatedAt;
}