package com.project4.DailyTask.global.response;

import java.time.Instant;

public record ErrorResponse(
        String errorCode,
        String message,
        String path,
        Instant timestamp
) {
    public static ErrorResponse of(String errorCode, String message, String path) {
        return new ErrorResponse(errorCode, message, path, Instant.now());
    }
}