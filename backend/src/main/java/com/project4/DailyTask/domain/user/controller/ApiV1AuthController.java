package com.project4.DailyTask.domain.user.controller;

import com.project4.DailyTask.domain.user.dto.LoginRequestDto;
import com.project4.DailyTask.domain.user.dto.TokenResponseDto;
import com.project4.DailyTask.domain.user.dto.UserResponseDto;
import com.project4.DailyTask.domain.user.service.AuthService;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.rq.Rq;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class ApiV1AuthController {

    private final AuthService authService;
    private final Rq rq;

    private static final int ACCESS = 60 * 60;
    private static final int REFRESH = 60 * 60 * 24 * 7;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponseDto>> login(
            @Valid @RequestBody LoginRequestDto req
    ) {
        TokenResponseDto token = authService.login(req);

        rq.setCookie("accessToken", token.getAccessToken(), ACCESS);
        rq.setCookie("refreshToken", token.getRefreshToken(), REFRESH);

        return ResponseEntity.ok(ApiResponse.ok(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @AuthenticationPrincipal SecurityUser user
    ) {
        authService.logout(user);

        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");
        rq.deleteCookie("JSESSIONID");
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponseDto>> refresh(
            @CookieValue("refreshToken") String refreshToken
    ) {
        TokenResponseDto token = authService.refresh(refreshToken);

        rq.setCookie("accessToken", token.getAccessToken(), ACCESS);
        rq.setCookie("refreshToken", token.getRefreshToken(), REFRESH);

        return ResponseEntity.ok(ApiResponse.ok(token));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> me(
            @AuthenticationPrincipal SecurityUser user
    ) {
        if (user == null) {
            throw new ApiException(ErrorCode.AUTHENTICATION_REQUIRED);
        }

        return ResponseEntity.ok(
                ApiResponse.ok(UserResponseDto.from(user))
        );
    }
}
