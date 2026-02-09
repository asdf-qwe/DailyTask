package com.project4.DailyTask.domain.team.dto;

import java.time.LocalDateTime;

public record UpdateTeamRes (Long id, String name, String description, LocalDateTime updatedAt) {}
