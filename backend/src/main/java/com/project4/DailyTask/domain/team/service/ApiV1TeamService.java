package com.project4.DailyTask.domain.team.service;


import com.project4.DailyTask.domain.team.dto.*;
import com.project4.DailyTask.domain.team.entity.*;
import com.project4.DailyTask.domain.team.repository.TeamInviteCodeRepository;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInviteCodeRepository teamInviteCodeRepository;

    @Transactional
    public CreateTeamResponse createTeam(CreateTeamRequest dto, SecurityUser user) {

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new ApiException(ErrorCode.TEAM_NAME_REQUIRED);
        }

        Team team = Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        teamRepository.save(team);

        TeamMember ownerMember = new TeamMember();
        ownerMember.setTeam(team);
        ownerMember.setUser(userRepository.getReferenceById(user.getId()));
        ownerMember.setRole(Role.OWNER);
        ownerMember.setTeamStatus(TeamStatus.JOINED);
        ownerMember.setJoinedAt(LocalDateTime.now());

        teamMemberRepository.save(ownerMember);


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

        if (!teamRepository.existsById(teamId)) {
            throw new ApiException(ErrorCode.TEAM_NOT_FOUND);
        }

        boolean isOwner = teamMemberRepository.existsByTeamIdAndUserIdAndRole(teamId, user.getId(), Role.OWNER);
        if (!isOwner) {
            throw new ApiException(ErrorCode.ADMIN_AUTH_REQUIRED);
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(dto.expiresInHours());

        teamInviteCodeRepository.deleteByTeamId(teamId);

        TeamInviteCode inviteCode = TeamInviteCode.builder()
                .code(UUID.randomUUID().toString().replace("-", ""))
                .expiresAt(expiresAt)
                .team(teamRepository.getReferenceById(teamId))
                .build();

        teamInviteCodeRepository.save(inviteCode);

        return new InviteCodeResponse(
                inviteCode.getCode(),
                inviteCode.getExpiresAt()
        );
    }

    @Transactional
    public JoinTeamResponse joinTeam(JoinTeamRequest dto, SecurityUser user) {

        TeamInviteCode inviteCode = teamInviteCodeRepository.findByCode(dto.getInviteCode())
                .orElseThrow(() -> new ApiException(ErrorCode.CODE_NOT_FOUND));

        Team team = inviteCode.getTeam();

        if (inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.INVITE_CODE_EXPIRED);
        }

        boolean exists = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId());
        if (exists) {
            throw new ApiException(ErrorCode.ALREADY_TEAM_MEMBER);
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(userRepository.getReferenceById(user.getId()));
        teamMember.setRole(Role.MEMBER);
        teamMember.setJoinedAt(LocalDateTime.now());

        teamMemberRepository.save(teamMember);

        return new JoinTeamResponse(
                team.getId(),
                team.getName(),
                teamMember.getRole()
        );
    }

    @Transactional
    public UpdateTeamRes updateTeam(Long teamId, SecurityUser user, UpdateTeamReq req){

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndRole(teamId, Role.OWNER)
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        if (!user.getId().equals(teamMember.getUser().getId())){
            throw new ApiException(ErrorCode.ONLY_OWNER_CAN_UPDATE);
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_NOT_FOUND));

        team.setName(req.getName());
        team.setDescription(req.getDescription());

        return new UpdateTeamRes(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getUpdatedAt()
        );

    }

    @Transactional
    public Boolean leftTeam(Long teamId, SecurityUser user) {

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        if (teamMember.getRole() == Role.OWNER) {
            throw new ApiException(ErrorCode.OWNER_CANNOT_LEAVE);
        }

        teamMemberRepository.delete(teamMember);

        return true;
    }

}
