package com.project4.DailyTask.domain.notification.controller;

import com.project4.DailyTask.domain.notification.dto.NotificationRes;
import com.project4.DailyTask.domain.notification.dto.SuccessRes;
import com.project4.DailyTask.domain.notification.service.ApiV1NotificationService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class ApiV1NotificationController {

    private final ApiV1NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationRes>> getNotifications(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) Boolean onlyUnread
    ) {
        return ApiResponse.ok(
                notificationService.getNotifications(user, onlyUnread)
        );
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<SuccessRes> readNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser user
    ) {
        notificationService.markAsRead(id, user);
        return ApiResponse.ok(new SuccessRes(true));
    }
}
