package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team,Long> {

    @Query("select t from Team t order by t.id desc")
    List<Team> findAllTeams();


    @Query("select distinct t from Team t left join fetch t.teamMembers order by t.id desc")
    List<Team> findAllTeamsWithMembers();
}
