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
    @Query("""
            select (count(tm) > 0)
            from TeamMember tm
            join tm.team t
            where t.id = :teamId
            and tm.user.id = :userId
            and tm.role = :role
            and tm.teamStatus = :teamStatus
            and t.deletedAt is null
            """)
    boolean existsByTeamIdAndUserIdAndRoleAndTeamStatus(Long teamId, Long userId, Role role, TeamStatus teamStatus);

    @Query("""
            select (count(tm) > 0)
            from TeamMember tm
            join tm.team t
            where t.id = :teamId
            and tm.user.id = :userId
            and tm.teamStatus = :teamStatus
            and t.deletedAt is null
            """)
    boolean existsByTeamIdAndUserIdAndTeamStatus(Long teamId, Long userId, TeamStatus teamStatus);

    @Query("""
            select tm
            from TeamMember tm
            join tm.team t
            where t.id = :teamId
            and tm.user.id = :userId
            and t.deletedAt is null
            """)
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    @Query("""
            select (count(tm) > 0)
            from TeamMember tm
            join tm.team t
            where t.id = :teamId
              and tm.user.id = :userId
              and t.deletedAt is null
            """)
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    @Query("""
            select tm
            from TeamMember tm
            join tm.team t
            join fetch tm.user
            where t.id = :teamId
            and t.deletedAt is null
            """)
    List<TeamMember> findAllByTeamIdWithUser(@Param("teamId") Long teamId);

    @Query("""
            select new com.project4.DailyTask.domain.team.dto.GetTeamRes(
            t.id,
            t.name,
            cast(count(m) as int),
            tm.role
            )
            from TeamMember tm
            join tm.team t
            left join t.teamMembers m on m.teamStatus = com.project4.DailyTask.domain.team.entity.TeamStatus.JOINED
            where tm.user.id = :userId
            and tm.teamStatus = com.project4.DailyTask.domain.team.entity.TeamStatus.JOINED
            and t.deletedAt is null
            group by t.id, t.name, tm.role
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
            join tm.team t
            join tm.user u
            where t.id = :teamId
              and tm.teamStatus = :status
              and t.deletedAt is null
            """)
    List<TeamMemberListRes> findMemberListByTeamIdAndStatus(@Param("teamId") Long teamId,
                                                            @Param("status") TeamStatus status);

    @Query("""
            select tm
            from TeamMember tm
            join fetch tm.user
            join fetch tm.team t
            where t.id = :teamId
            and tm.user.id = :userId
            and t.deletedAt is null
            """)
    Optional<TeamMember> findByTeamIdAndUserIdWithUserAndTeam(Long teamId, Long userId);
}
