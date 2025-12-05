package com.project4.DailyTask.team;

import com.project4.DailyTask.domain.memo.dtio.UpdateMemoReq;
import com.project4.DailyTask.domain.team.dto.CreateInviteCodeRequest;
import com.project4.DailyTask.domain.team.dto.CreateTeamRequest;
import com.project4.DailyTask.domain.team.dto.JoinTeamRequest;
import com.project4.DailyTask.domain.team.dto.UpdateTeamReq;
import com.project4.DailyTask.domain.team.entity.*;
import com.project4.DailyTask.domain.team.repository.TeamInviteCodeRepository;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.team.service.ApiV1TeamService;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeamServiceUnitTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private TeamInviteCodeRepository teamInviteCodeRepository;
    @InjectMocks
    private ApiV1TeamService teamService;
    @Captor
    private ArgumentCaptor<Team> teamArgumentCaptor;
    @Captor
    private ArgumentCaptor<TeamMember> teamMemberArgumentCaptor;

    private SecurityUser user1;
    private User user2;
    private CreateTeamRequest dto;
    private Team team;
    private CreateInviteCodeRequest createInviteCodeRequest;
    private JoinTeamRequest joinTeamRequest;
    private TeamInviteCode inviteCode;

    @BeforeEach
    void setup(){
        user1 = new SecurityUser(
                2L,
                "user@test.com",
                "encodedPassword",
                "Hyun",
                UserRole.ADMIN,
                List.of(() -> "ROLE_ADMIN")
        );

        user2 = User.builder()
                .id(2L)
                .email("user2@test.com")
                .password("encodedPassword")
                .nickname("hyun2")
                .role(UserRole.ADMIN)
                .build();

        team = Team.builder()
                .id(1L)
                .name("test")
                .description("desc")
                .build();

        inviteCode = TeamInviteCode.builder()
                .id(1L)
                .code("testCode")
                .expiresAt(LocalDateTime.now().plusHours(24))
                .team(team)
                .build();


        dto = new CreateTeamRequest("test1","description1");
        createInviteCodeRequest = new CreateInviteCodeRequest(24);
        joinTeamRequest = new JoinTeamRequest("testCode");
    }

    @Test
    @DisplayName("팀 생성 테스트")
    public void createTeam_success(){

    User mockUser = Mockito.mock(User.class);
    when(mockUser.getId()).thenReturn(user1.getId());
    when(userRepository.getReferenceById(user1.getId()))
                .thenReturn(mockUser);
    when(teamRepository.save(any(Team.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    teamService.createTeam(dto,user1);

    verify(teamRepository, times(1)).save(teamArgumentCaptor.capture());
    Team saved = teamArgumentCaptor.getValue();
    verify(teamMemberRepository, times(1)).save(teamMemberArgumentCaptor.capture());
    TeamMember memberSaved = teamMemberArgumentCaptor.getValue();

    assertEquals(dto.getName(), saved.getName());
    assertEquals(user1.getId(), memberSaved.getUser().getId());

    }

    @Test
    @DisplayName("팀 초대코드 생성")
    public void createCode_success(){

        when(teamRepository.getReferenceById(team.getId()))
                .thenReturn(team);

        when(teamRepository.existsById(team.getId())).thenReturn(true);
        when(teamMemberRepository.existsByTeamIdAndUserIdAndRole(team.getId(), user1.getId(), Role.OWNER))
                .thenReturn(true);

        teamService.createInviteCode(team.getId(),user1,createInviteCodeRequest);

        verify(teamInviteCodeRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("팀 참가 성공 테스트")
    public void joinTeam_success() {

        when(teamInviteCodeRepository.findByCode(joinTeamRequest.getInviteCode()))
                .thenReturn(Optional.of(inviteCode));

        when(teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user1.getId()))
                .thenReturn(false);

        when(userRepository.getReferenceById(user1.getId()))
                .thenReturn(mock(User.class));

        teamService.joinTeam(joinTeamRequest, user1);

        verify(teamMemberRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("팀 정보 수정 테스트")
    public void updateTeam_success(){

        TeamMember teamMember = new TeamMember();
        teamMember.setUser(user2);
        teamMember.setTeam(team);
        teamMember.setRole(Role.OWNER);
        teamMember.setTeamStatus(TeamStatus.JOINED);

        UpdateTeamReq req = new UpdateTeamReq("test2", "desc2");

        when(teamMemberRepository.findByTeamIdAndRole(team.getId(), Role.OWNER))
                .thenReturn(Optional.of(teamMember));
        when(teamRepository.findById(team.getId()))
                .thenReturn(Optional.ofNullable(team));

        teamService.updateTeam(team.getId(), user1, req);

        assertEquals(req.getName(), team.getName());
    }

    @Test
    @DisplayName("팀 멤버 목록 조회")
    public void getTeamMember_success(){

        TeamMember teamMember = new TeamMember();
        teamMember.setUser(user2);
        teamMember.setTeam(team);
        teamMember.setRole(Role.OWNER);
        teamMember.setTeamStatus(TeamStatus.JOINED);

        List<TeamMember> teamMembers = new ArrayList<>();
        teamMembers.add(teamMember);

        when(teamMemberRepository.existsByTeamIdAndUserId(team.getId(),user1.getId()))
                .thenReturn(true);

        when(teamMemberRepository.findAllByTeamIdWithUser(team.getId())).thenReturn(teamMembers);

    }

}
