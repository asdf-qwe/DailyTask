package com.project4.DailyTask.domain.message.entity;

import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @Column(name = "author_nickname_snapshot", nullable = false, length = 100)
    private String authorNicknameSnapshot;

    @Column(name = "author_id_snapshot")
    private Long authorIdSnapshot;

    public Message(Channel channel, User user, String content, String authorNicknameSnapshot, Long authorIdSnapshot){
        this.channel = channel;
        this.user = user;
        this.content = content;
        this.authorNicknameSnapshot = authorNicknameSnapshot;
        this.authorIdSnapshot = authorIdSnapshot;
    }
}
