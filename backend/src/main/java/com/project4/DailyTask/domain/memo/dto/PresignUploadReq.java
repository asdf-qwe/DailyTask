package com.project4.DailyTask.domain.memo.dto;

import lombok.Getter;

@Getter
public class PresignUploadReq {
    private Long teamId;
    private String contentType;
    private String extension;
}
