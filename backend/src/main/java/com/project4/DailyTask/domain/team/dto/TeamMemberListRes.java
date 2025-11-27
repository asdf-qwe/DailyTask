package com.project4.DailyTask.domain.team.dto;

import com.project4.DailyTask.domain.team.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter@Setter
public class TeamMemberListRes {
    public Long memberId;
    public Long userId;
    public String name;
    public String email;
    public Role role;
}
