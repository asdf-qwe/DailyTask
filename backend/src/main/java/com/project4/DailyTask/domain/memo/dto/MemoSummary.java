package com.project4.DailyTask.domain.memo.dto;

import com.project4.DailyTask.domain.memo.entity.Visibility;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MemoSummary (Long id, String title, String authorName, Visibility visibility, LocalDateTime createdAt){}
