package com.project4.DailyTask.domain.memo.dto;

import com.project4.DailyTask.domain.memo.entity.Visibility;

public record UpdateMemoReq(String title, String content, Visibility visibility){}
