package com.project4.DailyTask.domain.channel.entity;

import com.project4.DailyTask.domain.message.entity.Message;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class Channel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @OneToMany(mappedBy = "channel")
    private List<Message> messages = new ArrayList<>();

    public static Channel createChannel(Team team, String name){
        Channel channel = new Channel();
        channel.team = team;
        channel.name = name;
        return channel;
    }
}
