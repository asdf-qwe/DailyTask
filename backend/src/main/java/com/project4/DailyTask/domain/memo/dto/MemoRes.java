package com.project4.DailyTask.domain.memo.dto;

import com.project4.DailyTask.domain.memo.entity.Visibility;

import java.time.LocalDateTime;

public record MemoRes(Long id, Long teamId, String title, String content, MemoAuthor author,
                      Visibility visibility, LocalDateTime createdAt) {}
