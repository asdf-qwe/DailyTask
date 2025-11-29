package com.project4.DailyTask.domain.memo.dtio;

import com.project4.DailyTask.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class CreateMemoRes {

    private Long id;
    private Long teamId;
    private String title;
    private String content;
    private List<String> imageUrls;   // ← savedImages에서 추출
    private boolean sharedToTeam;     // ← req.getSharedToTeam()
    private Author author;
    private LocalDateTime createdAt;

    @Getter
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String name;
    }
}