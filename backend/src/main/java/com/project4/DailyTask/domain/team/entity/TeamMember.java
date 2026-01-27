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

    public boolean isOwner() {
        return this.role == Role.OWNER;
    }
    public boolean isJoined() {
        return this.teamStatus == TeamStatus.JOINED;
    }
    public boolean isLeft() {
        return this.teamStatus == TeamStatus.LEFT;
    }

    public static TeamMember createTeamMember(Team team, User user, Role role, LocalDateTime joinedAt){
        TeamMember teamMember = new TeamMember();
        teamMember.team = team;
        teamMember.user = user;
        teamMember.role = role;
        teamMember.teamStatus = TeamStatus.JOINED;
        teamMember.joinedAt = joinedAt;
        return teamMember;
    }


    public void applyOldMemberUpdate(){
        this.teamStatus = TeamStatus.JOINED;
        this.joinedAt = LocalDateTime.now();
        this.leftAt = null;
    }

    public void leftMember(){
        this.teamStatus = TeamStatus.LEFT;
    }

    public void changeTeam(Team team){
        this.team = team;
    }
    public void changeUser(User user){
        this.user = user;
    }

    public void leave() {
        if (this.role == Role.OWNER) throw new ApiException(ErrorCode.CANNOT_KICK_SELF);
        this.teamStatus = TeamStatus.LEFT;
    }
}
