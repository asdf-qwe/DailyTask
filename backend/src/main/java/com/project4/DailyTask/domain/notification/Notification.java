package com.project4.DailyTask.domain.notification;

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
public class Notification extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Column(name = "message", nullable = false, length = 200)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

}
