package com.project4.DailyTask.domain.todo.repository;

import com.project4.DailyTask.domain.todo.entity.QTodo;
import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
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
    public Page<Todo> searchMyTodos(Long userId, LocalDate date, TodoStatus status, Pageable pageable) {
        return searchTodos(userId, null, date, status, pageable);
    }

    @Override
    public Page<Todo> searchTeamTodos(Long teamId, LocalDate date, TodoStatus status, Pageable pageable) {
        return searchTodos(null, teamId, date, status, pageable);
    }

    private Page<Todo> searchTodos(Long userId, Long teamId, LocalDate date, TodoStatus status, Pageable pageable) {
        QTodo t = QTodo.todo;

        BooleanBuilder where = new BooleanBuilder();

        if (userId != null) {
            where.and(t.user.id.eq(userId))
                    .and(t.team.isNull());
        } else if (teamId != null) {
            where.and(t.team.id.eq(teamId));
        } else {
            throw new IllegalArgumentException("Either userId or teamId must be provided.");
        }

        if (status != null) {
            where.and(t.todoStatus.eq(status));
        }
        if (date != null) {
            where.and(t.dueDate.eq(date));
        }

        List<Todo> content = queryFactory
                .selectFrom(t)
                .where(where)
                .orderBy(toOrderSpecifiers(pageable, t))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(t.count())
                .from(t)
                .where(where)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0 : total);
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
                default -> {
                    throw new ApiException(ErrorCode.UNSUPPORTED_SORT);
                }
            }
        }

        if (orders.isEmpty()) {
            return new OrderSpecifier[]{ t.id.desc() };
        }
        return orders.toArray(new OrderSpecifier[0]);
    }
}
