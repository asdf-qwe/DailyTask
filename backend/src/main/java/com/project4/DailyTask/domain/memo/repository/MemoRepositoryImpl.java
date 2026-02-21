package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.dto.MemoSummary;
import com.project4.DailyTask.domain.memo.entity.QMemo;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.querydsl.core.BooleanBuilder;
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
                                        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        QMemo m = QMemo.memo;

        BooleanBuilder where = new BooleanBuilder()
                .and(m.team.id.eq(teamId))
                .and(m.visibility.eq(Visibility.TEAM)
                        .or(m.visibility.eq(Visibility.PRIVATE).and(m.user.id.eq(actorId))));

        if (authorId != null) {
            where.and(m.user.id.eq(authorId));
        }
        if (startDate != null) {
            where.and(m.createdAt.goe(startDate));
        }
        if (endDate != null) {
            where.and(m.createdAt.loe(endDate));
        }

        List<MemoSummary> content = queryFactory
                .select(com.querydsl.core.types.Projections.constructor(
                        MemoSummary.class,
                        m.id,
                        m.title,
                        m.user.nickname,
                        m.visibility.eq(Visibility.TEAM),
                        m.createdAt
                ))
                .from(m)
                .where(where)
                .orderBy(toOrderSpecifiers(pageable, m))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(m.count())
                .from(m)
                .where(where)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0 : total);
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

