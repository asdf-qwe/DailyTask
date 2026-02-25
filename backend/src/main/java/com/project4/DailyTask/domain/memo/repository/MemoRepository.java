package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.dto.RecentMemoRes;
import com.project4.DailyTask.domain.memo.entity.Memo;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemoRepository extends JpaRepository<Memo, Long>, MemoRepositoryCustom {
    @Query("""
            select m
            from Memo m
            join fetch m.user
            join fetch m.team
            where m.id = :memoId
            """)
    Optional<Memo> findMemoWithUser(@Param("memoId") Long memoId);

    @Query("""
            select new com.project4.DailyTask.domain.memo.dto.RecentMemoRes(
            m.id,
            m.title,
            u.nickname,
            m.createdAt
            )
            from Memo m
            join m.user u
            where m.team.id in :teamIds
            order by m.createdAt desc
            """)
    List<RecentMemoRes> findRecentMemos(
            @Param("teamIds") List<Long> teamIds,
            Pageable pageable
    );
}
