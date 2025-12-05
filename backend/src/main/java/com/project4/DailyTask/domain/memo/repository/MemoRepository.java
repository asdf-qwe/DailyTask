package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.entity.Memo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface MemoRepository extends JpaRepository<Memo, Long> {
    @Query("""
        SELECT m
        FROM Memo m
        WHERE m.team.id = :teamId
          AND (:authorId IS NULL OR m.user.id = :authorId)
          AND (:startDate IS NULL OR m.createdAt >= :startDate)
          AND (:endDate IS NULL OR m.createdAt <= :endDate)
        """)
    Page<Memo> findMemoList(
            @Param("teamId") Long teamId,
            @Param("authorId") Long authorId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.memo.id = :memoId")
    long countByMemoId(@Param("memoId") Long memoId);
}
