package com.project4.DailyTask.global.checker;

import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.entity.TeamStatus;
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

    public void requireReadableHistory(Long teamId, Long userId) {
        boolean wasMember = teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);
        if (!wasMember) {
            throw new ApiException(ErrorCode.TEAM_MESSAGE_ACCESS_DENIED);
        }
    }

    public void requireJoined(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        if (!member.isJoined()) {
            throw new ApiException(ErrorCode.TEAM_MEMBER_ONLY);
        }
    }

    public void requireOwner(Long teamId, Long userId){
        boolean isOwner = teamMemberRepository
                .existsByTeamIdAndUserIdAndRoleAndTeamStatus(teamId, userId, Role.OWNER, TeamStatus.JOINED);

        if (!isOwner) {
            throw new ApiException(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
    }
}
