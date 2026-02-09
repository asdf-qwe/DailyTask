package com.project4.DailyTask.domain.memo.dto;


import java.time.LocalDateTime;

public record CreateMemoRes (Long id, Long teamId, String title, String content,
                             boolean sharedToTeam, MemoAuthor author, LocalDateTime createdAt) {}