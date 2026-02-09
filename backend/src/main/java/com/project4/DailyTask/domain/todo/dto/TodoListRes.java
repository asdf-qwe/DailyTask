package com.project4.DailyTask.domain.todo.dto;

import java.util.List;

public record TodoListRes(
        List<TodoSummary> content,
        int page,
        int size,
        long totalElements
) {}
