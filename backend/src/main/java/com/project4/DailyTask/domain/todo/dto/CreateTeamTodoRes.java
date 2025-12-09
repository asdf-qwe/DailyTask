package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CreateTeamTodoRes {
    private Long id;
    private String title;
    private Long teamId;
    private LocalDate dueDate;
    private TodoStatus todoStatus;
}
