package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.TeamInviteCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamInviteCodeRepository extends JpaRepository<TeamInviteCode,Long> {
    Optional<TeamInviteCode> findByCode(String code);
    void deleteByTeamId(Long teamId);
}
