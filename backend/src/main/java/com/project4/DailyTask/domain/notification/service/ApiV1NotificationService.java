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
        return notificationRepository.findNotifications(user.getId(), Boolean.TRUE.equals(onlyUnread));
    }

    @Transactional
    public void createToMany(List<Long> receiverIds, NotificationType type, String message,
                             Long relatedMemoId, Long relatedTeamId) {
        List<Notification> notifications = createMany(receiverIds, type, message, relatedMemoId, relatedTeamId);

        notificationRepository.saveAll(notifications);
    }

    private List<Notification> createMany(List<Long> receiverIds, NotificationType type, String message,
                                          Long relatedMemoId, Long relatedTeamId) {
        return receiverIds.stream()
                .distinct()
                .map(id -> new Notification(
                        userRepository.getReferenceById(id),
                        type, message, relatedMemoId, relatedTeamId
                ))
                .toList();
    }

    @Transactional
    public void markAsRead(Long notificationId, SecurityUser user) {
        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.markRead();
    }
}