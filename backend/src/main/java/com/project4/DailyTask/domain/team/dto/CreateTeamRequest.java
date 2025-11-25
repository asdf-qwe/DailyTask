package com.project4.DailyTask.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateTeamRequest {
    private String name;
    private String description;
}
