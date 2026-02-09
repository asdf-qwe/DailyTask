package com.project4.DailyTask.domain.channel.dto;

import java.time.LocalDateTime;

public record CreateChannelRes (Long id, Long teamId, String name, LocalDateTime createdAt) {}
