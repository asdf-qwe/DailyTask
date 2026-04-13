package com.project4.DailyTask.domain.todo.dto;


import com.project4.DailyTask.domain.todo.entity.TodoStatus;

import java.time.LocalDate;

public record CalendarRes (
        Long id,
        Long teamId,
        String teamName,
        String title,
        LocalDate dueDate,
        TodoStatus todoStatus
){
}
