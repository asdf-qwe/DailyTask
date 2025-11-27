package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    boolean existsByTeamIdAndUserIdAndRole(Long teamId, Long userId, Role role);
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
    Optional<TeamMember> findByTeamIdAndRole(Long teamId, Role role);
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    @Query("""
       SELECT tm FROM TeamMember tm
       JOIN FETCH tm.user
       WHERE tm.team.id = :teamId
       """)
    List<TeamMember> findAllByTeamIdWithUser(@Param("teamId") Long teamId);

    void deleteByTeamIdAndUserId(Long teamId, Long userId);

}
