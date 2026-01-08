package com.project4.DailyTask.domain.memo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CreateMemoReq {
    private String title;
    private String content;
    private Boolean sharedToTeam;
}
