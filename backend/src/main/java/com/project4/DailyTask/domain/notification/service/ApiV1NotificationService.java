package com.project4.DailyTask.domain.notification.service;

import com.project4.DailyTask.domain.notification.dto.NotificationRes;
import com.project4.DailyTask.domain.notification.entity.Notification;
import com.project4.DailyTask.domain.notification.entity.NotificationType;
import com.project4.DailyTask.domain.notification.repository.NotificationRepository;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationRes> getNotifications(SecurityUser user, Boolean onlyUnread) {

        List<Notification> notifications =
                Boolean.TRUE.equals(onlyUnread)
                        ? notificationRepository
                        .findAllByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId())
                        : notificationRepository
                        .findAllByUserIdOrderByCreatedAtDesc(user.getId());

        return notifications.stream()
                .map(NotificationRes::from)
                .toList();
    }

    @Transactional
    public void create(
            Long receiverId,
            NotificationType type,
            String message,
            Long relatedMemoId,
            Long relatedTeamId
    ) {
        Notification notification = Notification.builder()
                .user(userRepository.getReferenceById(receiverId))
                .type(type)
                .message(message)
                .relatedMemoId(relatedMemoId)
                .relatedTeamId(relatedTeamId)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void createToMany(
            List<Long> receiverIds,
            NotificationType type,
            String message,
            Long relatedMemoId,
            Long relatedTeamId
    ) {
        List<Notification> notifications = receiverIds.stream()
                .distinct()
                .map(id -> Notification.builder()
                        .user(userRepository.getReferenceById(id))
                        .type(type)
                        .message(message)
                        .relatedMemoId(relatedMemoId)
                        .relatedTeamId(relatedTeamId)
                        .read(false)
                        .build()
                )
                .collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void markAsRead(Long notificationId, SecurityUser user) {
        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.markRead();
    }
}