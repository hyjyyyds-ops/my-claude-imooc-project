package com.expense.tracker.dto;

import com.expense.tracker.entity.User;
import lombok.Builder;
import lombok.Data;

/**
 * 用户视图对象（返回给前端）
 *
 * 注意：绝对不返回 password_hash
 */
@Data
@Builder
public class UserVO {

    private String id;
    private String username;
    private String avatar;
    private Long createdAt;

    public static UserVO fromEntity(User user) {
        if (user == null) return null;
        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .build();
    }
}