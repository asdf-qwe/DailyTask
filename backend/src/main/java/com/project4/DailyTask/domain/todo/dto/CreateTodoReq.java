package com.project4.DailyTask.domain.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTodoReq(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 100)
        String title,
        LocalDate dueDate){}