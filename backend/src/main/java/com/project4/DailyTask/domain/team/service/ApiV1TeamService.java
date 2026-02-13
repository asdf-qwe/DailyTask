package com.project4.DailyTask.domain.team.service;


import com.project4.DailyTask.domain.team.dto.*;
import com.project4.DailyTask.domain.team.entity.*;
import com.project4.DailyTask.domain.team.repository.TeamInviteCodeRepository;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInviteCodeRepository teamInviteCodeRepository;
    private final TeamMemberChecker teamMemberChecker;

    @Transactional
    public CreateTeamResponse createTeam(CreateTeamRequest dto, SecurityUser user) {
        User ref = userRepository.getReferenceById(user.getId());

        Team team = Team.createTeam(dto.name(), dto.description());

        teamRepository.save(team);

        TeamMember teamMember = TeamMember.createTeamMember(team, ref, Role.OWNER, LocalDateTime.now());

        teamMemberRepository.save(teamMember);

        return new CreateTeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                user.getId(),
                team.getCreatedAt()
        );
    }

    @Transactional
    public InviteCodeResponse createInviteCode(Long teamId, SecurityUser user, CreateInviteCodeRequest dto){
        Team team = findTeamOrThrow(teamId);
        validateOwner(teamId, user);

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(dto.expiresInHours());

        TeamInviteCode invite = teamInviteCodeRepository.findByTeamId(teamId)
                .orElseGet(() -> TeamInviteCode.createCode(expiresAt, team));

        invite.updateCode(expiresAt);
        teamInviteCodeRepository.save(invite);

        return new InviteCodeResponse(invite.getCode(), invite.getExpiresAt());
    }

    private void validateOwner(Long teamId, SecurityUser user){
        boolean isOwner = teamMemberRepository.existsByTeamIdAndUserIdAndRoleAndTeamStatus(teamId, user.getId(), Role.OWNER, TeamStatus.JOINED);
        if (!isOwner) {
            throw new ApiException(ErrorCode.ADMIN_PERMISSION_REQUIRED);
        }
    }
    public List<GetTeamRes> getTeam(SecurityUser user) {
        return teamMemberRepository.findMyTeamsWithJoinedCount(user.getId());
    }

    @Transactional
    public JoinTeamResponse joinTeam(JoinTeamRequest dto, SecurityUser user) {

        TeamInviteCode inviteCode = findValidInviteCode(dto.inviteCode());
        Team team = inviteCode.getTeam();

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(team.getId(), user.getId())
                .map(this::rejoinOrFail)
                .orElseGet(() -> createNewMemberSafely(team, user.getId()));

        return new JoinTeamResponse(team.getId(), team.getName(), member.getRole());
    }

    private TeamInviteCode findValidInviteCode(String code) {
        TeamInviteCode inviteCode = teamInviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new ApiException(ErrorCode.CODE_NOT_FOUND));

        if (inviteCode.isExpired(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.INVITE_CODE_EXPIRED);
        }
        return inviteCode;
    }

    private TeamMember rejoinOrFail(TeamMember oldMember) {
        if (oldMember.isJoined()) {
            throw new ApiException(ErrorCode.ALREADY_TEAM_MEMBER);
        }
        oldMember.applyOldMemberUpdate();
        return oldMember;
    }

    private TeamMember createNewMemberSafely(Team team, Long userId) {
        try {
            User ref = userRepository.getReferenceById(userId);
            TeamMember newMember = TeamMember.createTeamMember(team, ref, Role.MEMBER, LocalDateTime.now());
            return teamMemberRepository.save(newMember);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {

            TeamMember existing = teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId)
                    .orElseThrow(() -> e);
            return rejoinOrFail(existing);
        }
    }

    @Transactional
    public UpdateTeamRes updateTeam(Long teamId, SecurityUser user, UpdateTeamReq req){
        Team team = findTeamOrThrow(teamId);
        validateOwner(teamId,user);
        team.updateInfo(req.name(), req.description());
        return new UpdateTeamRes(team.getId(), team.getName(), team.getDescription(), team.getUpdatedAt());
    }

    private Team findTeamOrThrow(Long teamId){
        return teamRepository.findById(teamId)
                .orElseThrow(()->new ApiException(ErrorCode.TEAM_NOT_FOUND));
    }

    @Transactional
    public void leftTeam(Long teamId, SecurityUser user) {
        TeamMember member = teamMemberChecker.findMemberOrThrow(teamId, user.getId());
        member.leave();
    }

    public List<TeamMemberListRes> getTeamMembers(Long teamId, SecurityUser user) {

        boolean isMember = teamMemberRepository.existsByTeamIdAndUserIdAndTeamStatus(
                teamId, user.getId(), TeamStatus.JOINED
        );
        if (!isMember) throw new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND);

        return teamMemberRepository.findMemberListByTeamIdAndStatus(teamId, TeamStatus.JOINED);
    }

    @Transactional
    public void deleteMember(Long teamId, SecurityUser user, Long targetUserId){
        validateMemberDeleteAuthority(teamId,user,targetUserId);
        TeamMember member = teamMemberChecker.findMemberOrThrow(teamId, user.getId());
        member.leftMember();
    }

    private void validateMemberDeleteAuthority(Long teamId, SecurityUser user, Long targetUserId){

        if (targetUserId.equals(user.getId())) {
            throw new ApiException(ErrorCode.CANNOT_KICK_SELF);
        }

        boolean isOwner = teamMemberRepository
                .existsByTeamIdAndUserIdAndRoleAndTeamStatus(teamId, user.getId(), Role.OWNER, TeamStatus.JOINED);

        if (!isOwner) {
            throw new ApiException(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
    }

}
