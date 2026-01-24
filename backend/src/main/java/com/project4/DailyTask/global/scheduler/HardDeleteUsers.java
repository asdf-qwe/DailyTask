package com.project4.DailyTask.global.scheduler;

import com.project4.DailyTask.domain.message.repository.MessageRepository;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class HardDeleteUsers {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    @Transactional
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시
    public void hardDeleteUsers() {
        var targets = userRepository
                .findAllByStatusAndDeletedAtBefore(Status.DELETED, LocalDateTime.now().minusDays(30));

        for (User u : targets) {
            messageRepository.detachUserFromMessages(u.getId());
            userRepository.delete(u);
        }
    }

}
