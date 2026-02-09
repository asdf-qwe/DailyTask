package com.project4.DailyTask.domain.todo.dto;

import java.time.LocalDateTime;

public record UpdateTodoRes (Long id, LocalDateTime updatedAt) {}
