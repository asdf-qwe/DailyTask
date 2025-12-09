package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TodoListRes {
    private List<TodoSummary> content;
    private int page;
    private int size;
    private long totalElements;


    @Getter
    @AllArgsConstructor
    @Builder
    public static class TodoSummary{
        private Long id;
        private String title;
        private LocalDate dueDate;
        private TodoStatus todoStatus;
    }
}
