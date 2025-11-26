package com.project4.DailyTask.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
@AllArgsConstructor
public class UpdateTeamReq {
    private String name;
    private String description;
}
