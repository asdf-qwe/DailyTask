package com.project4.DailyTask.domain.team.dto;

import com.project4.DailyTask.domain.team.entity.Role;

public record GetTeamRes(Long teamId, String name, long memberCount, Role role) {}
