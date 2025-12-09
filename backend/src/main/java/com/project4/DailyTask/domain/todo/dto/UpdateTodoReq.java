package com.project4.DailyTask.domain.todo.dto;

import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UpdateTodoReq {
    private String title;
    private LocalDate date;
    private TodoStatus status;
}
