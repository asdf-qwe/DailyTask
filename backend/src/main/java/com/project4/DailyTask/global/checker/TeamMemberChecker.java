package com.project4.DailyTask.global.checker;

import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamMemberChecker {
    private final TeamMemberRepository teamMemberRepository;

    public TeamMember findMemberOrThrow(Long teamId, Long userId){
        return teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .filter(TeamMember::isJoined)
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));
    }

    public TeamMember findTeamMemberWithRefsOrThrow(Long teamId, Long userId) {
        return teamMemberRepository.findByTeamIdAndUserIdWithUserAndTeam(teamId, userId)
                .filter(TeamMember::isJoined)
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));
    }
}
