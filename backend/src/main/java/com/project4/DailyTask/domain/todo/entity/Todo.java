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
public class Todo extends BaseEntity {

    private static final int MAX_TITLE_LENGTH = 100;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title", nullable = false, length = MAX_TITLE_LENGTH)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "todo_status", nullable = false)
    private TodoStatus todoStatus;

    @Column(name = "due_date")
    private LocalDate dueDate;

    public static Todo createPersonal(User owner, String title, LocalDate dueDate) {
        return create(owner, null, title, dueDate);
    }

    public static Todo createForTeam(User owner, Team team, String title, LocalDate dueDate) {
        if (team == null) {
            throw new IllegalArgumentException("team todo는 team이 필요합니다.");
        }
        return create(owner, team, title, dueDate);
    }

    private static Todo create(User owner, Team team, String title, LocalDate dueDate) {
        if (owner == null) {
            throw new IllegalArgumentException("todo는 owner가 필요합니다.");
        }

        Todo todo = new Todo();
        todo.owner = owner;
        todo.team = team;
        todo.todoStatus = TodoStatus.PENDING;
        todo.changeTitle(title);
        todo.changeDueDate(dueDate);
        return todo;
    }

    public boolean isOwnedBy(Long userId) {
        return userId != null && owner.getId().equals(userId);
    }

    public boolean belongsToTeam() {
        return team != null;
    }

    public Long teamIdOrNull() {
        return team == null ? null : team.getId();
    }

    public void changeTitle(String title) {
        if (title == null) {
            throw new ApiException(ErrorCode.TODO_TITLE_REQUIRED);
        }

        String value = title.trim();

        if (value.isBlank()) {
            throw new ApiException(ErrorCode.TODO_TITLE_REQUIRED);
        }

        if (value.length() > MAX_TITLE_LENGTH) {
            throw new ApiException(ErrorCode.TODO_TITLE_TOO_LONG);
        }

        this.title = value;
    }

    public void changeDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void changeStatus(TodoStatus status) {
        if (status == null) {
            throw new ApiException(ErrorCode.TODO_STATUS_REQUIRED);
        }
        this.todoStatus = status;
    }
}