package com.project4.DailyTask.memo;

import com.project4.DailyTask.domain.memo.dtio.CreateMemoReq;
import com.project4.DailyTask.domain.memo.entity.Memo;
import com.project4.DailyTask.domain.memo.entity.MemoImage;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.domain.memo.repository.MemoImageRepository;
import com.project4.DailyTask.domain.memo.repository.MemoRepository;
import com.project4.DailyTask.domain.memo.service.ApiV1MemoService;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.entity.TeamStatus;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.user.entity.Status;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MemoCreateTest {

    @Mock
    private MemoRepository memoRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private MemoImageRepository memoImageRepository;
    @InjectMocks
    private ApiV1MemoService memoService;
    @Captor
    private ArgumentCaptor<Memo> memoArgumentCaptor;
    @Captor
    private ArgumentCaptor<MemoImage> memoImageArgumentCaptor;

    private SecurityUser loginUser;
    private Team team;
    private TeamMember teamMember;
    private User user;
    private CreateMemoReq req;

    @BeforeEach
    void setup(){
        loginUser = new SecurityUser(
                1L,
                "user@test.com",
                "encodedPassword",
                "Hyun",
                UserRole.ADMIN,
                List.of(() -> "ROLE_ADMIN")
        );

        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .password("encodedPassword")
                .nickname("Hyun")
                .profile_url(null)
                .status(Status.ACTIVE)
                .role(UserRole.ADMIN)
                .build();

        team = Team.builder()
                .id(1L)
                .name("test")
                .description("desc")
                .build();

        teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(user);
        teamMember.setRole(Role.MEMBER);
        teamMember.setTeamStatus(TeamStatus.JOINED);

        List<String> urls = new ArrayList<>();
        urls.add("asd");
        urls.add("zcx");
        req = new CreateMemoReq("test","test1",urls, true);

    }

    @Test
    @DisplayName("메모 생성 api 테스트 및 팀 공유, 메모 이미지 자동 저장 기능 테스트")
    public void createMemo_success() {

        when(userRepository.getReferenceById(loginUser.getId()))
                .thenReturn(user);

        when(teamMemberRepository.findByTeamIdAndUserId(team.getId(), loginUser.getId()))
                .thenReturn(Optional.of(teamMember));

        memoService.createMemo(team.getId(), loginUser, req);

        verify(memoRepository, times(1)).save(memoArgumentCaptor.capture());
        Memo saved = memoArgumentCaptor.getValue();

        assertEquals(Visibility.TEAM, saved.getVisibility());

        assertEquals(req.getImageUrls().size(), saved.getImages().size());

        List<String> savedUrls = saved.getImages()
                .stream()
                .map(MemoImage::getImageUrl)
                .toList();

        assertTrue(savedUrls.containsAll(req.getImageUrls()));
    }

}
