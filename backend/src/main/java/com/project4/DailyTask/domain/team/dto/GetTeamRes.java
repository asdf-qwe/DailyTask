package com.project4.DailyTask.domain.team.dto;

import lombok.Builder;

@Builder
public class GetTeamRes {
    public Long teamId;
    public String name;
    public Integer memberCount;
}
