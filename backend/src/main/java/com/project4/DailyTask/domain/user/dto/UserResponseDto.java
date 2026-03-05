package com.project4.DailyTask.domain.user.dto;

import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;


public record UserResponseDto (Long id, String email, String nickname, UserRole role){}
