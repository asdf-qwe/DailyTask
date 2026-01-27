package com.project4.DailyTask.domain.memo.dto;

public record CreateMemoReq(String title, String content, Boolean sharedToTeam){}