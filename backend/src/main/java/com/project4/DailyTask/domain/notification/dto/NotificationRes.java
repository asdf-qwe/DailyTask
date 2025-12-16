package com.project4.DailyTask.domain.notification.dto;

import com.project4.DailyTask.domain.notification.entity.Notification;
import com.project4.DailyTask.domain.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationRes {

    private Long id;
    private NotificationType type;
    private String message;

    private Long relatedMemoId;
    private Long relatedTeamId;

    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationRes from(Notification n) {
        return NotificationRes.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .relatedMemoId(n.getRelatedMemoId())
                .relatedTeamId(n.getRelatedTeamId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

