package com.project4.DailyTask.domain.team.entity;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(
        name = "team_member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_team_member_team_user", columnNames = {"team_id", "user_id"})
        }
)
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

    public boolean isJoined() {
        return this.teamStatus == TeamStatus.JOINED;
    }

    public TeamMember (Team team, User user, Role role, LocalDateTime joinedAt){
        this.team = team;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public void applyOldMemberUpdate(){
        this.teamStatus = TeamStatus.JOINED;
        this.joinedAt = LocalDateTime.now();
        this.leftAt = null;
    }

    public void leftMember(){
        this.teamStatus = TeamStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }

    public void leave() {
        if (this.role == Role.OWNER) throw new ApiException(ErrorCode.OWNER_CANNOT_LEAVE);
        this.teamStatus = TeamStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }

    public boolean isOwner(Role role){
        return this.role == Role.OWNER;
    }
    public boolean isOwner(){
        return this.role == Role.OWNER;
    }

}
