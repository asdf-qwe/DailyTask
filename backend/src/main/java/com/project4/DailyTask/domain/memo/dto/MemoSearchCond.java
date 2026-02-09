package com.project4.DailyTask.domain.memo.dto;


import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

public record MemoSearchCond (
        Long authorId,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        LocalDateTime startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        LocalDateTime endDate
) {}
