package com.project4.DailyTask.domain.team.entity;

import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_team_invite_code_team", columnNames = "team_id"),
                @UniqueConstraint(name = "uk_team_invite_code_code", columnNames = "code")
        }
)
public class TeamInviteCode extends BaseEntity {

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    public TeamInviteCode(LocalDateTime expiresAt, Team team){
        this.code = UUID.randomUUID().toString().replace("-","");
        this.expiresAt = expiresAt;
        this.team = team;
    }

    public boolean isExpired(LocalDateTime now) {
        return expiresAt.isBefore(now);
    }

    public void updateCode(LocalDateTime newExpiresAt){
        this.code = UUID.randomUUID().toString().replace("-","");
        this.expiresAt = newExpiresAt;
    }
}
