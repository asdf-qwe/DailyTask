package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team,Long> {
    @Query("""
            select t
            from Team t
            order by t.id desc
            """)
    List<Team> findAllTeams();

    @Query("""
            select distinct t
            from Team t
            left join fetch t.teamMembers
            order by t.id desc
            """)
    List<Team> findAllTeamsWithMembers();

    @Query("""
            select t
            from Team t
            where t.id = :teamId
            and t.deletedAt is null
            """)
    Optional<Team> findActiveById(@Param("teamId") Long teamId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from Team t
            where t.deletedAt is not null
            and t.deletedAt < :threshold
            """)
    int deleteByDeletedAtBefore(@Param("threshold") LocalDateTime threshold);
}
