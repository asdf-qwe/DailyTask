package com.project4.DailyTask.domain.team.entity;

import com.project4.DailyTask.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter@Setter
@NoArgsConstructor
public class TeamMember{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Role role = Role.MEMBER;

    @Column(name = "team_status")
    @Enumerated(EnumType.STRING)
    private TeamStatus teamStatus = TeamStatus.JOINED;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    private LocalDateTime leftAt;
}
