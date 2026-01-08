package com.project4.DailyTask.domain.team.dto;

import com.project4.DailyTask.domain.team.entity.Role;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class JoinTeamResponse {
    private Long teamId;
    private String teamName;
    private Role role;
}
