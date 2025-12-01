package com.project4.DailyTask.domain.memo.controller;

import com.project4.DailyTask.domain.memo.dtio.MemoListRes;
import com.project4.DailyTask.domain.memo.dtio.MemoSearchCond;
import com.project4.DailyTask.domain.memo.service.ApiV1MemoService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/teams")
public class ApiV1MemoController {

    private final ApiV1MemoService memoService;

    @GetMapping("/{teamId}/memos")
    public ResponseEntity<ApiResponse<MemoListRes>> getMemos(
            @PathVariable Long teamId,
            @AuthenticationPrincipal SecurityUser loginUser,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @ModelAttribute MemoSearchCond cond
    ) {

        MemoListRes memoListRes = memoService.getMemoList(teamId, loginUser, pageable, cond);

        return ResponseEntity.ok(ApiResponse.ok(memoListRes));
    }



}
