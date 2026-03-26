package com.project4.DailyTask.domain.memo.dto;


import com.project4.DailyTask.domain.memo.entity.Visibility;

import java.time.LocalDateTime;

public record CreateMemoRes (Long id, Long teamId, String title, String content,
                             Visibility visibility, MemoAuthor author, LocalDateTime createdAt) {}