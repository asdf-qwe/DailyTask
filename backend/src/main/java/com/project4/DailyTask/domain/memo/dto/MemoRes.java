package com.project4.DailyTask.domain.memo.dto;

import java.time.LocalDateTime;

public record MemoRes(Long id, Long teamId, String title, String content, MemoAuthor author,
                      boolean sharedToTeam, LocalDateTime createdAt) {}
