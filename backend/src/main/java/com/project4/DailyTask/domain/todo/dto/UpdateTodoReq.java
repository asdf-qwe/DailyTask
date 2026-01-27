package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import java.time.LocalDate;

public record UpdateTodoReq(String title, LocalDate date, TodoStatus status){}