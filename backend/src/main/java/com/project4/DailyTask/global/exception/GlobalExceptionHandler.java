package com.project4.DailyTask.global.exception;

import com.project4.DailyTask.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException e, HttpServletRequest req) {
        ErrorCode code = e.getErrorCode();

        log.warn("API_EX method={} uri={} errorCode={} status={} msg={}",
                req.getMethod(),
                req.getRequestURI(),
                code.name(),                 // enum 이름을 코드로 사용
                code.getHttpStatus().value(),
                code.getMessage()
        );

        return ResponseEntity
                .status(code.getHttpStatus())
                .body(ApiResponse.fail(code.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception e, HttpServletRequest req) {

        log.error("UNHANDLED_EX method={} uri={} msg={}",
                req.getMethod(),
                req.getRequestURI(),
                e.getMessage(),
                e
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("서버 내부 오류가 발생했습니다."));
    }
}