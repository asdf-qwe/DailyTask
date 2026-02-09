package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;

import java.time.LocalDate;

public record CreateTeamTodoRes (Long id, String title, Long teamId, LocalDate dueDate, TodoStatus todoStatus) {}
