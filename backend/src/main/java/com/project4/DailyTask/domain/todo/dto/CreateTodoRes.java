package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CreateTodoRes {
    private Long id;
    private String title;
    private LocalDate dueDate;
    private TodoStatus todoStatus;
}
