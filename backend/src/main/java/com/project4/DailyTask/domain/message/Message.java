package com.project4.DailyTask.domain.message;

import com.project4.DailyTask.domain.channel.Channel;
import com.project4.DailyTask.domain.user.entity.User;
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
public class Message extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

}
