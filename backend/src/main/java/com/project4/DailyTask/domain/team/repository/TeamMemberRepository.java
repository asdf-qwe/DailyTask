package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    boolean existsByTeamIdAndUserIdAndRole(Long teamId, Long userId, Role role);
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
    Optional<TeamMember> findByTeamIdAndRole(Long teamId, Role role);
}
