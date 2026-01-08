package com.project4.DailyTask.domain.team.service;

import com.project4.DailyTask.domain.team.dto.TeamListRes;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamPerfService {

    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<TeamListRes> listTeamsNPlusOne() {
        List<Team> teams = teamRepository.findAllTeams();
        return teams.stream()
                .map(t -> new TeamListRes(
                        t.getId(),
                        t.getName(),
                        t.getTeamMembers().size()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<TeamListRes> listTeamsFetchJoin() {
        List<Team> teams = teamRepository.findAllTeamsWithMembers(); // 1쿼리
        return teams.stream()
                .map(t -> new TeamListRes(
                        t.getId(),
                        t.getName(),
                        t.getTeamMembers().size()
                ))
                .toList();
    }
}