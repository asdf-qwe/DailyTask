package com.project4.DailyTask.domain.user.dto;

import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {

    private Long id;
    private String loginId;
    private String email;
    private String nickname;
    private String profileUrl;
    private Status status;
    private UserRole role;

    public static UserResponseDto fromEntity(User user){
        return UserResponseDto.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileUrl(user.getProfileUrl())
                .status(user.getStatus())
                .role(user.getRole())
                .build();
    }
}
