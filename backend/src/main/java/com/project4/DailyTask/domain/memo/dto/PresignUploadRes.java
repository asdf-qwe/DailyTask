package com.project4.DailyTask.domain.memo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PresignUploadRes {
    private String key;
    private String uploadUrl;
}