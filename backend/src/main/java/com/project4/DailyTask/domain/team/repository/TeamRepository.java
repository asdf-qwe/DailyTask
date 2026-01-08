package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team,Long> {
    // ✅ N+1 유발: Team만 조회 (teamMembers는 LAZY)
    @Query("select t from Team t order by t.id desc")
    List<Team> findAllTeams();

    // ✅ 개선: teamMembers를 fetch join으로 같이 로딩
    @Query("select distinct t from Team t left join fetch t.teamMembers order by t.id desc")
    List<Team> findAllTeamsWithMembers();
}
