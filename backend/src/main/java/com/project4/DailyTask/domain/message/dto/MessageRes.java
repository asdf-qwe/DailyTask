package com.project4.DailyTask.domain.message.dto;

import java.time.LocalDateTime;

public record MessageRes (Long id, Long channelId, MessageAuthor author, String content, LocalDateTime createdAt){}
