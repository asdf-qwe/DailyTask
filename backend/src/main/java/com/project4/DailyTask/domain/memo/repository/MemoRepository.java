package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.entity.Memo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoRepository extends JpaRepository<Memo, Long> {
}
