package com.project4.DailyTask.domain.user.controller;

import com.project4.DailyTask.domain.user.dto.SignupRequestDto;
import com.project4.DailyTask.domain.user.dto.UserResponseDto;
import com.project4.DailyTask.domain.user.service.AuthLoginService;
import com.project4.DailyTask.domain.user.service.UserService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.rq.Rq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class ApiV1UserController {

    private final UserService userService;
    private final AuthLoginService authLoginService;

    private final Rq rq;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Valid @RequestBody SignupRequestDto)
}
