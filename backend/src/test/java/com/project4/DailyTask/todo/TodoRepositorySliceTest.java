package com.project4.DailyTask.todo;

import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.todo.dto.TodoSummary;
import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import com.project4.DailyTask.domain.todo.repository.TodoRepository;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.data.domain.*;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;


import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

@ActiveProfiles("test")
@DataJpaTest
@Import(TodoRepositorySliceTest.QuerydslTestConfig.class)
class TodoRepositorySliceTest {

    @Autowired EntityManager em;
    @Autowired TodoRepository todoRepository;

    private Long user1Id;
    private Long user2Id;
    private Long team1Id;

    private final LocalDate D1 = LocalDate.of(2026, 2, 5);
    private final LocalDate D2 = LocalDate.of(2026, 2, 6);

    @BeforeEach
    void setUp() {

        User u1 = User.builder()
                .loginId("u1")
                .email("u1@test.com")
                .password("pw")
                .nickname("u1")
                .role(UserRole.USER)
                .status(Status.ACTIVE)
                .build();

        User u2 = User.builder()
                .loginId("u2")
                .email("u2@test.com")
                .password("pw")
                .nickname("u2")
                .role(UserRole.USER)
                .status(Status.ACTIVE)
                .build();

        Team team = Team.createTeam("team-1", "desc-1");

        em.persist(u1);
        em.persist(u2);
        em.persist(team);

        user1Id = u1.getId();
        user2Id = u2.getId();
        team1Id = team.getId();


        em.persist(Todo.createTeamTodo(u1, null, "u1-personal-pending", D1));
        Todo doneTodo = Todo.createTeamTodo(u1, null, "u1-personal-done", D1);
        doneTodo.changeStatus(TodoStatus.DONE);
        em.persist(doneTodo);


        em.persist(Todo.createTeamTodo(u2, null, "u2-personal-pending", D1));


        em.persist(Todo.createTeamTodo(u1, team, "team1-todo-d1", D1));
        em.persist(Todo.createTeamTodo(u2, team, "team1-todo-d2", D2));

        em.flush();
        em.clear();
    }

    @Test
    @DisplayName("searchMyTodos: userId + team is null만 조회되고 status/date 필터가 적용된다")
    void searchMyTodos_filters_personal_only_and_status_date() {

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.desc("id")));

        Page<TodoSummary> page = todoRepository.searchMyTodos(
                user1Id,
                D1,
                TodoStatus.PENDING,
                pageable
        );


        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent())
                .extracting(TodoSummary::title)
                .containsExactly("u1-personal-pending");

    }

    @Test
    @DisplayName("searchTeamTodos: teamId로 팀 TODO만 조회되고 페이징/total count가 정확하다")
    void searchTeamTodos_filters_team_only_and_paging_total() {

        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Order.asc("dueDate")));

        Page<TodoSummary> page = todoRepository.searchTeamTodos(
                team1Id,
                null,
                TodoStatus.PENDING,
                pageable
        );


        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().getFirst().dueDate()).isEqualTo(D1);
    }

    @Test
    @DisplayName("기본 정렬: Sort 없으면 id desc가 적용된다")
    void default_sort_is_id_desc_when_unsorted() {

        Pageable pageable = PageRequest.of(0, 10);

        Page<TodoSummary> page =
                todoRepository.searchMyTodos(user1Id, null, null, pageable);


        assertThat(page.getContent()).hasSize(2);

        Long firstId = page.getContent().get(0).id();
        Long secondId = page.getContent().get(1).id();

        assertThat(firstId).isGreaterThan(secondId);
    }

    @Test
    @DisplayName("미지원 정렬 필드면 ApiException(UNSUPPORTED_SORT)이 발생한다")
    void unsupported_sort_throws() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("hackerField"));

        assertThatThrownBy(() ->
                todoRepository.searchTeamTodos(team1Id, null, null, pageable)
        ).isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getErrorCode()).isEqualTo(ErrorCode.UNSUPPORTED_SORT);
                });
    }

    @TestConfiguration
    static class QuerydslTestConfig {
        @Bean
        JPAQueryFactory jpaQueryFactory(EntityManager em) {
            return new JPAQueryFactory(em);
        }
    }
}
