package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.dto.GetTeamRes;
import com.project4.DailyTask.domain.team.dto.TeamMemberListRes;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.Team;
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
    Optional<TeamMember> findByTeamIdAndUserIdAndTeamStatus(Long teamId, Long userId, TeamStatus status);

    @Query("""
       SELECT tm FROM TeamMember tm
       JOIN FETCH tm.user
       WHERE tm.team.id = :teamId
       """)
    List<TeamMember> findAllByTeamIdWithUser(@Param("teamId") Long teamId);


    void deleteByTeamIdAndUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    List<TeamMember> findAllByUserId(Long userId);

    @Query("SELECT tm FROM TeamMember tm " +
            "JOIN FETCH tm.team t " +
            "LEFT JOIN FETCH t.teamMembers " +
            "WHERE tm.user.id = :userId " +
            "AND tm.teamStatus = 'JOINED'")
    List<TeamMember> findAllByUserIdWithTeamMembers(@Param("userId") Long userId);

    @Query("""
        select new com.project4.DailyTask.domain.team.dto.GetTeamRes(
            t.id,
            t.name,
            cast(count(m) as int)
        )
        from TeamMember my
        join my.team t
        left join t.teamMembers m on m.teamStatus = com.project4.DailyTask.domain.team.entity.TeamStatus.JOINED
        where my.user.id = :userId
          and my.teamStatus = com.project4.DailyTask.domain.team.entity.TeamStatus.JOINED
        group by t.id, t.name
        """)
    List<GetTeamRes> findMyTeamsWithJoinedCount(@Param("userId") Long userId);

    @Query("""
            select new com.project4.DailyTask.domain.team.dto.TeamMemberListRes(
                tm.id,
                u.id,
                u.nickname,
                u.email,
                tm.role
            )
            from TeamMember tm
            join tm.user u
            where tm.team.id = :teamId
              and tm.teamStatus = :status
            """)
    List<TeamMemberListRes> findMemberListByTeamIdAndStatus(@Param("teamId") Long teamId,
                                                            @Param("status") TeamStatus status);
}
