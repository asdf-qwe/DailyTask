package com.project4.DailyTask.domain.todo.entity;

import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class Todo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "todo_status", nullable = false)
    private TodoStatus todoStatus = TodoStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    // 판단 메서드
    public boolean isOwner(Long userId) {
        return this.user != null && this.user.getId().equals(userId);
    }

    public boolean isTeamTodo() {
        return this.team != null;
    }

    public Long getTeamId() {
        return this.team == null ? null : this.team.getId();
    }


    public void applyUpdate(String title, LocalDate dueDate, TodoStatus todoStatus) {
        if (title != null) changeTitle(title);
        if (dueDate != null) changeDueDate(dueDate);
        if (todoStatus != null) changeStatus(todoStatus);
    }

    // 도메인 메서드: 최소 검증(최후 방어선)
    public void changeTitle(String title) {
        String v = title.trim();
        if (v.isBlank()) {
            throw new ApiException(ErrorCode.TODO_TITLE_REQUIRED);
        }
        if (v.length() > 100) {
            throw new ApiException(ErrorCode.TODO_TITLE_TOO_LONG);
        }
        this.title = v;
    }

    public void changeDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void changeStatus(TodoStatus todoStatus) {
        this.todoStatus = todoStatus;
    }

    public static Todo createTeamTodo(User user, Team team, String title, LocalDate dueDate) {
        Todo todo = new Todo();
        todo.user = user;
        todo.team = team;
        todo.todoStatus = TodoStatus.PENDING;
        todo.changeTitle(title);
        todo.changeDueDate(dueDate);
        return todo;
    }

    public static Todo createPersonalTodo(User user, String title, LocalDate dueDate) {
        Todo todo = new Todo();
        todo.user = user;
        todo.team = null;
        todo.todoStatus = TodoStatus.PENDING;
        todo.changeTitle(title);
        todo.changeDueDate(dueDate);
        return todo;
    }
}
