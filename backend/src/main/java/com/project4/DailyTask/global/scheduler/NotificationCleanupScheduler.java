package com.project4.DailyTask.global.scheduler;

import com.project4.DailyTask.domain.notification.entity.Notification;
import com.project4.DailyTask.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(15);
        int deletedCount = notificationRepository.deleteByCreatedAtBefore(threshold);

        log.info("[Scheduler] 하드 삭제된 알림 수: {}", deletedCount);
    }
}