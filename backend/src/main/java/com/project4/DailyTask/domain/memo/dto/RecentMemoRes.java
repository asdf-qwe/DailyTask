package com.project4.DailyTask.domain.memo.dto;

import java.time.LocalDateTime;

public record RecentMemoRes (Long id, String title, String authorName, LocalDateTime createdAt){}
