package com.project4.DailyTask.domain.memo.dto;

import java.util.List;

public record MemoListRes (List<MemoSummary> items, int page, int size, long totalElements){}
