package com.project4.DailyTask.global.response;


import lombok.AllArgsConstructor;
import lombok.Getter;


public record ApiResponse<T>(
        T data,
        String message
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, "요청이 성공했습니다.");
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message);
    }
}