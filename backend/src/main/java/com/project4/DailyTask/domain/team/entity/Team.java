package com.project4.DailyTask.domain.team.entity;

import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Team extends BaseEntity {

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "team", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TeamMember> teamMembers = new ArrayList<>();

    public void changeTeamName(String name) {
        String v = name.trim();
        if (v.isBlank()) {
            throw new ApiException(ErrorCode.TEAM_NAME_REQUIRED);
        }
        if (v.length() > 50) {
            throw new ApiException(ErrorCode.TEAM_NAME_TOO_LONG);
        }
        this.name = v;
    }

    public static Team createTeam(String name, String description){
        Team team = new Team();
        team.changeTeamName(name);
        team.description = description;
        return team;
    }

    public void updateInfo(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void delete() {
        if (this.deletedAt == null) {
            this.deletedAt = LocalDateTime.now();
        }
    }

}
