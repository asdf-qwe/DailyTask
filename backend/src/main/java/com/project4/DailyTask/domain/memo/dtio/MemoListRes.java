package com.project4.DailyTask.domain.memo.dtio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemoListRes {
    private List<MemoSummary> items;
    private int page;
    private int size;
    private long totalElements;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class MemoSummary{
        private Long id;
        private String title;
        private String preview;
        private String authorName;
        private Boolean sharedToTeam;
        private LocalDateTime createdAt;
    }
}
