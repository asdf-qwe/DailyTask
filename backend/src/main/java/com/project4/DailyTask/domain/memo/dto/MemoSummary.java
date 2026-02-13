package com.project4.DailyTask.domain.memo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MemoSummary (Long id, String title, String authorName, Boolean sharedToTeam, LocalDateTime createdAt){}
