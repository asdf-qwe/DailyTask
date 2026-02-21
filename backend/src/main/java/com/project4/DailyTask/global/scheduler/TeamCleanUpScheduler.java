package com.project4.DailyTask.global.scheduler;

import com.project4.DailyTask.domain.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamCleanUpScheduler {

    private final TeamRepository teamRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteOldTeams() {

        LocalDateTime threshold = LocalDateTime.now().minusDays(15);

        int deletedCount = teamRepository.deleteByDeletedAtBefore(threshold);

        log.info("[Scheduler] 하드 삭제된 팀 수: {}", deletedCount);
    }
}