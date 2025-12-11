package com.project4.DailyTask.domain.channel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ChannelListRes {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
}