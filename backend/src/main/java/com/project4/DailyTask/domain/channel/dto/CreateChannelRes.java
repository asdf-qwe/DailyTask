package com.project4.DailyTask.domain.channel.dto;

import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
public class CreateChannelRes {
    private Long id;
    private Long teamId;
    private String name;
    private LocalDateTime createdAt;
}
