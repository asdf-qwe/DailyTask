package com.project4.DailyTask.domain.channel;

import com.project4.DailyTask.domain.team.entity.Team;
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

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class Channel extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

}
