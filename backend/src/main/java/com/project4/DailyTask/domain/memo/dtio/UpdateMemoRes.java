package com.project4.DailyTask.domain.memo.dtio;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UpdateMemoRes {
    private Long id;
    private String title;
    private LocalDateTime updatedAt;
}
