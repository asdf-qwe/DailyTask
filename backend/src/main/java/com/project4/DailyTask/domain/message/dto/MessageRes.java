package com.project4.DailyTask.domain.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class MessageRes {
    private Long id;
    private Long channelId;
    private Author author;
    private String content;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String name;
    }
}
