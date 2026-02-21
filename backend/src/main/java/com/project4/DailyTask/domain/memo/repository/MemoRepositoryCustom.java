package com.project4.DailyTask.domain.memo.repository;

import com.project4.DailyTask.domain.memo.dto.MemoSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.time.LocalDateTime;

public interface MemoRepositoryCustom {
    Page<MemoSummary> searchMemo(Long teamId,
                                 Long actorId,
                                 Long authorId,
                                 LocalDateTime startDate,
                                 LocalDateTime endDate,
                                 Pageable pageable);

}
