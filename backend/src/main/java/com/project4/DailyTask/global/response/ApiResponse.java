package com.project4.DailyTask.global.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    public static <T> ApiResponse<T> ok(T data){
        return new ApiResponse<>(true, "요청이 성공했습니다.", data);
    }

    public static <T> ApiResponse<T> ok(){
        return new ApiResponse<>(true, "요청이 성공했습니다.", null);
    }

    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
