package com.project4.DailyTask.domain.memo.dto;

import java.time.LocalDate;

public record MemoSummary (Long id, String title, String authorName, Boolean sharedToTeam, LocalDate createdAt){}
