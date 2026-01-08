package com.project4.DailyTask.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TeamListRes {
    private Long teamId;
    private String name;
    private int memberCount;
}