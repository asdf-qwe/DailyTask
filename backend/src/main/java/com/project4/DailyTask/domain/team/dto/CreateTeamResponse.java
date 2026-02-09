package com.project4.DailyTask.domain.team.dto;


import java.time.LocalDateTime;

public record CreateTeamResponse (Long id, String name, String description, Long ownerId, LocalDateTime createdAt) {}
