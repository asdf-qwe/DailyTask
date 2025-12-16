package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.entity.TeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    boolean existsByTeamIdAndUserIdAndRoleAndTeamStatus(Long teamId, Long userId, Role role, TeamStatus teamStatus);
    boolean existsByTeamIdAndUserIdAndTeamStatus(Long teamId, Long userId, TeamStatus teamStatus);
    Optional<TeamMember> findByTeamIdAndRoleAndTeamStatus(Long teamId, Role role, TeamStatus teamStatus);
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    @Query("""
select tm
from TeamMember tm
join fetch tm.user
where tm.team.id = :teamId
  and tm.teamStatus = :status
""")
    List<TeamMember> findAllByTeamIdAndStatusWithUser(@Param("teamId") Long teamId,
                                                      @Param("status") TeamStatus status);


    @Query("""
       SELECT tm FROM TeamMember tm
       JOIN FETCH tm.user
       WHERE tm.team.id = :teamId
       """)
    List<TeamMember> findAllByTeamIdWithUser(@Param("teamId") Long teamId);

    void deleteByTeamIdAndUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
