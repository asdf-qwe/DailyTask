package com.project4.DailyTask.team;

import com.project4.DailyTask.domain.team.dto.CreateInviteCodeRequest;
import com.project4.DailyTask.domain.team.dto.CreateTeamRequest;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
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

import java.util.List;

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
    private CreateTeamRequest dto;
    private Team team;
    private CreateInviteCodeRequest createInviteCodeRequest;
    @BeforeEach
    void setup(){
        user1 = new SecurityUser(
                1L,
                "user@test.com",
                "encodedPassword",
                "Hyun",
                UserRole.ADMIN,
                List.of(() -> "ROLE_ADMIN")
        );

        team = Team.builder()
                .id(1L)
                .name("test")
                .description("desc")
                .build();


        dto = new CreateTeamRequest("test1","description1");
        createInviteCodeRequest = new CreateInviteCodeRequest(24);

    }

    @Test
    @DisplayName("팀 생성 테스트")
    public void creatTeam_success(){

    User mockUser = Mockito.mock(User.class);
    when(mockUser.getId()).thenReturn(user1.getId());
    when(userRepository.getReferenceById(user1.getId()))
                .thenReturn(mockUser);
    when(teamRepository.save(any(Team.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    teamService.createTeam(dto,user1);

    verify(teamRepository).save(teamArgumentCaptor.capture());
    Team saved = teamArgumentCaptor.getValue();
    verify(teamMemberRepository).save(teamMemberArgumentCaptor.capture());
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

        verify(teamInviteCodeRepository).save(any());
    }
}
