package com.project4.DailyTask.domain.memo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class MemoRes {
    private Long id;
    private Long teamId;
    private String title;
    private String content;
    private CreateMemoRes.Author author;
    private boolean sharedToTeam;
    private LocalDateTime createdAt;

    @Getter
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String name;
    }
}
