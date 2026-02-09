package com.project4.DailyTask.domain.memo.dto;

import java.time.LocalDateTime;

public record UpdateMemoRes (Long id, String title, LocalDateTime updatedAt) {}
