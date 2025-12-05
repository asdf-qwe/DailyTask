package com.project4.DailyTask.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class SignupRequestDto {
    @NotBlank(message = "아이디는 필수 입니다.")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수 입니다.")
    private String password;

    private String email;
    private String nickname;

}
