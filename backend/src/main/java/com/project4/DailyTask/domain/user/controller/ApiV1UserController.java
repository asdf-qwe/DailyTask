package com.project4.DailyTask.domain.user.controller;

import com.project4.DailyTask.domain.user.dto.SignupRequestDto;
import com.project4.DailyTask.domain.user.dto.UserResponseDto;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.service.UserService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class ApiV1UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Valid @RequestBody SignupRequestDto req) {
        User user = userService.signup(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(UserResponseDto.fromEntity(user)));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<String>> checkEmail(@RequestParam String email) {
        userService.checkEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.ok("사용 가능한 이메일입니다."));
    }

    @GetMapping("/check-loginId")
    public ResponseEntity<ApiResponse<String>> checkLoginId(@RequestParam String loginId) {
        userService.checkLoginIdAvailable(loginId);
        return ResponseEntity.ok(ApiResponse.ok("사용 가능한 아이디입니다."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> withdraw(@AuthenticationPrincipal SecurityUser user) {
        userService.withdraw(user);
        return ResponseEntity.ok(ApiResponse.ok("탈퇴 요청이 처리되었습니다."));
    }
}
