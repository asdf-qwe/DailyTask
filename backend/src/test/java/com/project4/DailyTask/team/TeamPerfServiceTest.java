package com.project4.DailyTask.team;

import com.project4.DailyTask.domain.team.dto.TeamListRes;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.team.service.TeamPerfService;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TeamPerfServiceTest {

    private final TeamPerfService teamPerfService;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final EntityManagerFactory emf;
    private final EntityManager em;

    private Statistics statistics;

    TeamPerfServiceTest(
            TeamPerfService teamPerfService,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository,
            EntityManagerFactory emf,
            EntityManager em
    ) {
        this.teamPerfService = teamPerfService;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.emf = emf;
        this.em = em;
    }

    @BeforeEach
    void setUp() {
        SessionFactory sf = emf.unwrap(SessionFactory.class);
        statistics = sf.getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();
    }

    @Test
    @DisplayName("N+1 버전: team 조회 1회 + teamMembers 조회가 team 수만큼 추가 발생한다")
    @Transactional
    void nPlusOne_queryCount_increases_by_teamCount() {

        int teamCount = 30;
        int membersPerTeam = 10;
        seedTeams(teamCount, membersPerTeam);

        em.flush();
        em.clear();

        statistics.clear();

        List<TeamListRes> result = teamPerfService.listTeamsNPlusOne();
        long queryCount = statistics.getPrepareStatementCount();

        assertThat(result).hasSize(teamCount);

        assertThat(queryCount).isGreaterThanOrEqualTo(1L + teamCount);
    }

    @Test
    @DisplayName("Fetch Join 버전: team + teamMembers를 1회(또는 1~2회) 쿼리로 로딩한다")
    @Transactional
    void fetchJoin_queryCount_is_small() {

        int teamCount = 30;
        int membersPerTeam = 10;
        seedTeams(teamCount, membersPerTeam);

        em.flush();
        em.clear();

        statistics.clear();

        List<TeamListRes> result = teamPerfService.listTeamsFetchJoin();
        long queryCount = statistics.getPrepareStatementCount();

        assertThat(result).hasSize(teamCount);

        assertThat(queryCount).isBetween(1L, 2L);
    }

    private void seedTeams(int teamCount, int membersPerTeam) {
        for (int i = 1; i <= teamCount; i++) {
            Team team = Team.builder()
                    .name("team-" + i)
                    .description("desc-" + i)
                    .build();
            teamRepository.save(team);

            for (int j = 1; j <= membersPerTeam; j++) {
                User user = createUser("user-" + i + "-" + j);

                TeamMember tm = new TeamMember();
                tm.setTeam(team);
                tm.setUser(user);
                tm.setJoinedAt(LocalDateTime.now());


                teamMemberRepository.save(tm);
            }
        }
    }


    private User createUser(String key) {
        User user = User.builder()
                .loginId("login_" + key)
                .email(key + "@test.com")
                .password("encodedPassword")
                .nickname("nick_" + key)
                .role(UserRole.USER)
                .status(Status.ACTIVE)
                .build();

        return userRepository.save(user);
    }
}