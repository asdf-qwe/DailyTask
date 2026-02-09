package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;

import java.time.LocalDate;

public record CreateTodoRes (Long id, String title, LocalDate dueDate, TodoStatus todoStatus) {}
