package com.project4.DailyTask.domain.todo.repository;

import com.project4.DailyTask.domain.team.entity.QTeam;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.todo.dto.TodoSummary;
import com.project4.DailyTask.domain.todo.entity.QTodo;
import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TodoRepositoryImpl implements TodoRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<TodoSummary> searchMyTodos(Long userId, LocalDate date, TodoStatus status, Pageable pageable) {
        return searchTodosDto(userId, null, date, status, pageable);
    }

    @Override
    public Page<TodoSummary> searchTeamTodos(Long teamId, LocalDate date, TodoStatus status, Pageable pageable) {
        return searchTodosDto(null, teamId, date, status, pageable);
    }

    private Page<TodoSummary> searchTodosDto(Long userId, Long teamId, LocalDate date, TodoStatus status, Pageable pageable) {
        QTodo t = QTodo.todo;
        QTeam tm = QTeam.team;

        if (userId == null && teamId == null) {
            throw new IllegalArgumentException("userId 또는 teamId 중 하나는 필수입니다.");
        }

        List<TodoSummary> content = queryFactory
                .select(com.querydsl.core.types.Projections.constructor(
                        TodoSummary.class,
                        t.id,
                        tm.name,
                        t.title,
                        t.dueDate,
                        t.todoStatus
                ))
                .from(t)
                .leftJoin(t.team, tm)
                .where(
                        scopeFilter(t, userId, teamId),
                        statusEq(t, status),
                        dueDateEq(t, date)
                )
                .orderBy(toOrderSpecifiers(pageable, t))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(t.count())
                .from(t)
                .where(
                        scopeFilter(t, userId, teamId),
                        statusEq(t, status),
                        dueDateEq(t, date)
                )
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0 : total);
    }

    private BooleanExpression scopeFilter(QTodo t, Long userId, Long teamId) {
        if (userId != null) {
            return t.user.id.eq(userId).and(t.team.isNull());
        }
        if (teamId != null) {
            return t.team.id.eq(teamId);
        }
        return null;
    }

    private BooleanExpression statusEq(QTodo t, TodoStatus status) {
        return status != null ? t.todoStatus.eq(status) : null;
    }

    private BooleanExpression dueDateEq(QTodo t, LocalDate date) {
        return date != null ? t.dueDate.eq(date) : null;
    }

    private OrderSpecifier<?>[] toOrderSpecifiers(Pageable pageable, QTodo t) {
        if (pageable.getSort().isUnsorted()) {
            return new OrderSpecifier[]{ t.id.desc() };
        }

        List<OrderSpecifier<?>> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;

            switch (order.getProperty()) {
                case "id" -> orders.add(new OrderSpecifier<>(direction, t.id));
                case "dueDate" -> orders.add(new OrderSpecifier<>(direction, t.dueDate));
                case "todoStatus" -> orders.add(new OrderSpecifier<>(direction, t.todoStatus));
                case "createdAt" -> orders.add(new OrderSpecifier<>(direction, t.createdAt));
                default -> throw new ApiException(ErrorCode.UNSUPPORTED_SORT);
            }
        }

        return orders.isEmpty() ? new OrderSpecifier[]{ t.id.desc() } : orders.toArray(new OrderSpecifier[0]);
    }
}