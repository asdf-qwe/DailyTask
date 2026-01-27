package com.project4.DailyTask.domain.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 50)
        String name,
        String description ){}