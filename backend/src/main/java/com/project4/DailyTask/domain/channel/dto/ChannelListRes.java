package com.project4.DailyTask.domain.channel.dto;


import java.time.LocalDateTime;

public record ChannelListRes (Long id, String name, String teamName, LocalDateTime createdAt){}