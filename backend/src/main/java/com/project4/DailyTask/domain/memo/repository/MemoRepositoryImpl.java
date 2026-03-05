package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.dto.MemoSummary;
import com.project4.DailyTask.domain.memo.entity.QMemo;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class MemoRepositoryImpl implements MemoRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<MemoSummary> searchMemo(Long teamId, Long actorId, Long authorId,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        Pageable pageable) {

        QMemo m = QMemo.memo;

        List<MemoSummary> content = queryFactory
                .select(Projections.constructor(
                        MemoSummary.class,
                        m.id,
                        m.title,
                        m.user.nickname,
                        m.visibility.eq(Visibility.TEAM),
                        m.createdAt
                ))
                .from(m)
                .where(
                        teamIdEq(teamId),
                        visibilityFilter(actorId),
                        authorIdEq(authorId),
                        createdAfter(startDate),
                        createdBefore(endDate)
                )
                .orderBy(toOrderSpecifiers(pageable, m))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(m.count())
                .from(m)
                .where(
                        teamIdEq(teamId),
                        visibilityFilter(actorId),
                        authorIdEq(authorId),
                        createdAfter(startDate),
                        createdBefore(endDate)
                )
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0 : total);
    }

    private BooleanExpression teamIdEq(Long teamId) {
        return QMemo.memo.team.id.eq(teamId);
    }

    private BooleanExpression visibilityFilter(Long actorId) {
        QMemo m = QMemo.memo;
        return m.visibility.eq(Visibility.TEAM)
                .or(m.visibility.eq(Visibility.PRIVATE)
                        .and(m.user.id.eq(actorId)));
    }

    private BooleanExpression authorIdEq(Long authorId) {
        return authorId != null ? QMemo.memo.user.id.eq(authorId) : null;
    }

    private BooleanExpression createdAfter(LocalDateTime startDate) {
        return startDate != null ? QMemo.memo.createdAt.goe(startDate) : null;
    }

    private BooleanExpression createdBefore(LocalDateTime endDate) {
        return endDate != null ? QMemo.memo.createdAt.loe(endDate) : null;
    }

    private com.querydsl.core.types.OrderSpecifier<?>[] toOrderSpecifiers(Pageable pageable, QMemo m) {
        if (pageable.getSort().isUnsorted()) {
            return new com.querydsl.core.types.OrderSpecifier[]{ m.id.desc() };
        }

        List<com.querydsl.core.types.OrderSpecifier<?>> orders = new ArrayList<>();

        for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
            com.querydsl.core.types.Order direction =
                    order.isAscending() ? com.querydsl.core.types.Order.ASC : com.querydsl.core.types.Order.DESC;

            switch (order.getProperty()) {
                case "id" -> orders.add(new com.querydsl.core.types.OrderSpecifier<>(direction, m.id));
                case "title" -> orders.add(new com.querydsl.core.types.OrderSpecifier<>(direction, m.title));
                case "createdAt" -> orders.add(new com.querydsl.core.types.OrderSpecifier<>(direction, m.createdAt));
                case "authorName" -> orders.add(new com.querydsl.core.types.OrderSpecifier<>(direction, m.user.nickname));
                default -> throw new ApiException(ErrorCode.UNSUPPORTED_SORT);
            }
        }

        if (orders.isEmpty()) {
            return new com.querydsl.core.types.OrderSpecifier[]{ m.id.desc() };
        }
        return orders.toArray(new com.querydsl.core.types.OrderSpecifier[0]);
    }
}

