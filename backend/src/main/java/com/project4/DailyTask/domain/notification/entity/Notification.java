package com.project4.DailyTask.domain.notification.entity;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String message;

    private Long relatedMemoId;
    private Long relatedTeamId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    public void markRead() {
        if (this.read) {
            throw new ApiException(ErrorCode.NOTIFICATION_ALREADY_READ);
        }
        this.read = true;
    }

    public static Notification createNotification(User user, NotificationType type, String message,
                                                  Long relatedMemoId, Long relatedTeamId){
        Notification notification = new Notification();
        notification.user = user;
        notification.type = type;
        notification.message = message;
        notification.relatedMemoId = relatedMemoId;
        notification.relatedTeamId = relatedTeamId;
        notification.read = false;
        return notification;
    }
}
