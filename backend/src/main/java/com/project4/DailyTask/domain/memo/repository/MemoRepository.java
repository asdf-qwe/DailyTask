package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.entity.Memo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
