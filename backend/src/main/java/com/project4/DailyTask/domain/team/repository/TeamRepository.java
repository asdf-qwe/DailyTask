package com.project4.DailyTask.domain.team.repository;

import com.project4.DailyTask.domain.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team,Long> {
}
