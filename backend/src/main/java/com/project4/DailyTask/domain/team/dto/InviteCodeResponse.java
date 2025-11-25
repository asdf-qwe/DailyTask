package com.project4.DailyTask.domain.team.dto;

import java.time.LocalDateTime;

public record InviteCodeResponse(String inviteCode, LocalDateTime expiresAt) {}
