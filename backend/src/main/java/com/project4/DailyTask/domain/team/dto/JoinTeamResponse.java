package com.project4.DailyTask.domain.team.dto;

import com.project4.DailyTask.domain.team.entity.Role;

public record JoinTeamResponse (Long teamId, String teamName, Role role) {}
