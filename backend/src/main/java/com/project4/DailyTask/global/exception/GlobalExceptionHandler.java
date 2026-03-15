package com.project4.DailyTask.global.exception;

import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException e, HttpServletRequest req) {
        ErrorCode code = e.getErrorCode();

        log.warn("API_EX method={} uri={} errorCode={} status={} msg={}",
                req.getMethod(),
                req.getRequestURI(),
                code.name(),
                code.getHttpStatus().value(),
                code.getMessage()
        );

        return ResponseEntity
                .status(code.getHttpStatus())
                .body(ErrorResponse.of(code.name(), code.getMessage(), req.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e, HttpServletRequest req) {

        log.error("UNHANDLED_EX method={} uri={} msg={}",
                req.getMethod(),
                req.getRequestURI(),
                e.getMessage(),
                e
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.", req.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("잘못된 요청입니다.");

        ErrorResponse body = new ErrorResponse(
                "INVALID_INPUT",
                message,
                request.getRequestURI(),
                Instant.now()
        );

        return ResponseEntity.badRequest().body(body);
    }
}