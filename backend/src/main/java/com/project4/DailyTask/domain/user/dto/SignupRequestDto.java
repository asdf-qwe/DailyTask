package com.project4.DailyTask.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignupRequestDto(
        @NotBlank(message = "아이디는 필수 입니다.")
        String loginId,

        @NotBlank(message = "비밀번호는 필수 입니다.")
        String password,

        @NotBlank(message = "이메일은 필수 입니다.")
        @Email(message = "올바른 이메일 형식이어야 합니다.")
        String email,

        @NotBlank(message = "닉네임은 필수 입니다.")
        String nickname
){}