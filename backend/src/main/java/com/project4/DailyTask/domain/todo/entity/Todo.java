package com.project4.DailyTask.domain.todo.entity;

import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.user.entity.User;
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
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class Todo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    private TodoStatus todoStatus = TodoStatus.PENDING;

    private LocalDate dueDate;

}
