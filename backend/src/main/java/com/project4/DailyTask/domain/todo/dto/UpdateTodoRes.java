package com.project4.DailyTask.domain.todo.dto;

import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
public class UpdateTodoRes {
    private Long id;
    private LocalDateTime updatedAt;
}
