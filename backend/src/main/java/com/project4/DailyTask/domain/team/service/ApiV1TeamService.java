package com.project4.DailyTask.domain.team.service;


import com.project4.DailyTask.domain.team.dto.CreateInviteCodeRequest;
import com.project4.DailyTask.domain.team.dto.CreateTeamRequest;
import com.project4.DailyTask.domain.team.dto.CreateTeamResponse;
import com.project4.DailyTask.domain.team.dto.InviteCodeResponse;
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
}
