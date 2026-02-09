package com.project4.DailyTask.team;

import com.project4.DailyTask.domain.team.dto.JoinTeamRequest;
import com.project4.DailyTask.domain.team.dto.JoinTeamResponse;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamInviteCode;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamInviteCodeRepository;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.team.service.ApiV1TeamService;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceUnitTest {

    @Mock TeamRepository teamRepository;
    @Mock UserRepository userRepository;
    @Mock TeamMemberRepository teamMemberRepository;
    @Mock TeamInviteCodeRepository teamInviteCodeRepository;
    @Mock TeamMemberChecker teamMemberChecker;

    @InjectMocks ApiV1TeamService service;


    private SecurityUser testUser(Long userId) {
        return new SecurityUser(
                userId,
                "test@test.com",
                "pw",
                "tester",
                UserRole.USER,
                List.of()
        );
    }

    @Test
    void joinTeam_초대코드없으면_CODE_NOT_FOUND() {
        // given
        SecurityUser user = testUser(1L);
        JoinTeamRequest req = new JoinTeamRequest("INVALID");

        when(teamInviteCodeRepository.findByCode("INVALID"))
                .thenReturn(Optional.empty());

        // when
        ApiException ex = assertThrows(ApiException.class,
                () -> service.joinTeam(req, user));

        // then
        assertEquals(ErrorCode.CODE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void joinTeam_초대코드만료면_INVITE_CODE_EXPIRED() {
        // given
        SecurityUser user = testUser(1L);
        JoinTeamRequest req = new JoinTeamRequest("ABC");

        TeamInviteCode inviteCode = mock(TeamInviteCode.class);

        when(teamInviteCodeRepository.findByCode("ABC"))
                .thenReturn(Optional.of(inviteCode));
        when(inviteCode.isExpired(any(LocalDateTime.class)))
                .thenReturn(true);

        // when
        ApiException ex = assertThrows(ApiException.class,
                () -> service.joinTeam(req, user));

        // then
        assertEquals(ErrorCode.INVITE_CODE_EXPIRED, ex.getErrorCode());
    }

    @Test
    void joinTeam_이미_JOINED_멤버면_ALREADY_TEAM_MEMBER() {
        // given
        SecurityUser user = testUser(1L);
        JoinTeamRequest req = new JoinTeamRequest("ABC");

        Team team = mock(Team.class);
        when(team.getId()).thenReturn(10L);

        TeamInviteCode inviteCode = mock(TeamInviteCode.class);
        when(inviteCode.isExpired(any())).thenReturn(false);
        when(inviteCode.getTeam()).thenReturn(team);

        TeamMember member = mock(TeamMember.class);
        when(member.isJoined()).thenReturn(true);

        when(teamInviteCodeRepository.findByCode("ABC"))
                .thenReturn(Optional.of(inviteCode));
        when(teamMemberRepository.findByTeamIdAndUserId(10L, 1L))
                .thenReturn(Optional.of(member));

        // when
        ApiException ex = assertThrows(ApiException.class,
                () -> service.joinTeam(req, user));

        // then
        assertEquals(ErrorCode.ALREADY_TEAM_MEMBER, ex.getErrorCode());
    }

    @Test
    void joinTeam_LEFT_멤버면_rejoin된다() {

        SecurityUser user = testUser(1L);
        JoinTeamRequest req = new JoinTeamRequest("ABC");

        Team team = mock(Team.class);
        when(team.getId()).thenReturn(10L);
        when(team.getName()).thenReturn("TEAM");

        TeamInviteCode inviteCode = mock(TeamInviteCode.class);
        when(inviteCode.isExpired(any())).thenReturn(false);
        when(inviteCode.getTeam()).thenReturn(team);

        TeamMember oldMember = mock(TeamMember.class);
        when(oldMember.isJoined()).thenReturn(false);
        when(oldMember.getRole()).thenReturn(Role.MEMBER);

        when(teamInviteCodeRepository.findByCode("ABC"))
                .thenReturn(Optional.of(inviteCode));
        when(teamMemberRepository.findByTeamIdAndUserId(10L, 1L))
                .thenReturn(Optional.of(oldMember));

        // when
        JoinTeamResponse res = service.joinTeam(req, user);

        // then
        verify(oldMember).applyOldMemberUpdate();
        assertEquals(10L, res.teamId());
        assertEquals("TEAM", res.teamName());
        assertEquals(Role.MEMBER, res.role());
    }

    @Test
    void joinTeam_신규멤버면_저장된다() {
        // given
        SecurityUser user = testUser(1L);
        JoinTeamRequest req = new JoinTeamRequest("ABC");

        Team team = mock(Team.class);
        when(team.getId()).thenReturn(10L);
        when(team.getName()).thenReturn("TEAM");

        TeamInviteCode inviteCode = mock(TeamInviteCode.class);
        when(inviteCode.isExpired(any())).thenReturn(false);
        when(inviteCode.getTeam()).thenReturn(team);

        when(teamInviteCodeRepository.findByCode("ABC"))
                .thenReturn(Optional.of(inviteCode));
        when(teamMemberRepository.findByTeamIdAndUserId(10L, 1L))
                .thenReturn(Optional.empty());

        when(userRepository.getReferenceById(1L))
                .thenReturn(mock(User.class));

        TeamMember saved = mock(TeamMember.class);
        when(saved.getRole()).thenReturn(Role.MEMBER);

        when(teamMemberRepository.save(any(TeamMember.class)))
                .thenReturn(saved);

        // when
        JoinTeamResponse res = service.joinTeam(req, user);

        // then
        verify(teamMemberRepository).save(any(TeamMember.class));
        assertEquals(Role.MEMBER, res.role());
    }
}
