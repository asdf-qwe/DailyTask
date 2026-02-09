package com.project4.DailyTask.domain.team.dto;


import com.project4.DailyTask.domain.team.entity.Role;

public record TeamMemberListRes (
        Long memberId,
        Long userId,
        String name,
        String email,
        Role role
        ){}
