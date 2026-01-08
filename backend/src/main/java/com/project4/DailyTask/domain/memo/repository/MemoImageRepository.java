package com.project4.DailyTask.domain.memo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemoImageRepository extends JpaRepository<MemoImage, Long> {
    List<MemoImage> findByMemoId(Long memoId);
}
