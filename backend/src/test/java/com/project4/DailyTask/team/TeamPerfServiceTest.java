package com.project4.DailyTask.team;

import com.project4.DailyTask.domain.team.dto.TeamListRes;
import com.project4.DailyTask.domain.team.entity.Role;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TeamPerfServiceTest {

    @Autowired
    EntityManagerFactory emf;

    @Autowired
    EntityManager em;

    @Autowired
    TeamRepository teamRepository;

    @Autowired
    TeamMemberRepository teamMemberRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TeamPerfService teamPerfService;

    private Statistics statistics;

    @BeforeEach
    void setUp() {
        SessionFactory sf = emf.unwrap(SessionFactory.class);
        statistics = sf.getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();
    }

    @Test
    @DisplayName("N+1 재현: 팀 목록 조회 시 팀 수만큼 teamMembers 추가 쿼리가 발생한다")
    @Transactional
    void listTeams_nPlusOne_queryCount_increases_by_teamCount() {

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
    @DisplayName("개선 후(fetch join): 팀 + 팀원 조회가 1~2회 쿼리로 끝난다")
    @Transactional
    void listTeams_fetchJoin_queryCount_is_small() {

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
            Team team = Team.createTeam("team-" + i, "desc-" + i);
            teamRepository.save(team);

            for (int j = 1; j <= membersPerTeam; j++) {
                User user = createUser("u" + i + "_" + j);

                TeamMember tm = TeamMember.createTeamMember(team, user, Role.MEMBER, LocalDateTime.now());

                teamMemberRepository.save(tm);
            }
        }
    }

    private User createUser(String key) {

        User user = User.createNew(
                "login_" + key,
                key + "@test.com",
                "encodedPassword",
                "nick_" + key
                );

        return userRepository.save(user);
    }
}