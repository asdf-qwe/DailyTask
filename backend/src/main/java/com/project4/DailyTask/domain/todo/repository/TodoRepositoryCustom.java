package com.project4.DailyTask.domain.todo.repository;

import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface TodoRepositoryCustom {
    Page<Todo> searchMyTodos(Long userId, LocalDate date, TodoStatus status, Pageable pageable);
    Page<Todo> searchTeamTodos(Long teamId, LocalDate date, TodoStatus status, Pageable pageable);
}