package com.project4.DailyTask.domain.team.entity;

import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class TeamInviteCode extends BaseEntity {

    @Column(name = "code")
    private String code;

    @Column(name = "expiresAt")
    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
}
