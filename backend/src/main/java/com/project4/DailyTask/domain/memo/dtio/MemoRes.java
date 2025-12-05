package com.project4.DailyTask.domain.memo.dtio;

import com.project4.DailyTask.domain.memo.entity.Visibility;
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
    private List<String> imageUrls;
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
