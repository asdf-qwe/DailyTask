package com.project4.DailyTask.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record SignupRequestDto(
        @NotBlank(message = "아이디는 필수 입니다.")
        String loginId,

        @NotBlank(message = "비밀번호는 필수 입니다.")
        String password,

        String email,
        String nickname
){}