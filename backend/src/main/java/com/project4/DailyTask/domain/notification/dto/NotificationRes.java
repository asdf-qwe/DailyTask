package com.project4.DailyTask.domain.notification.dto;

import com.project4.DailyTask.domain.notification.entity.NotificationType;

import java.time.LocalDateTime;


public record NotificationRes (
        Long id,
        NotificationType type,
        String message,
        Long relatedChannelId,
        Long relatedTeamId,
        boolean read,
        LocalDateTime createdAt
){}

