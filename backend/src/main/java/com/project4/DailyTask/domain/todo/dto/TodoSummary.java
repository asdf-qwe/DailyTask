package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;

import java.time.LocalDate;

public record TodoSummary(
        Long id,
        String name,
        String title,
        LocalDate dueDate,
        TodoStatus todoStatus
) {}