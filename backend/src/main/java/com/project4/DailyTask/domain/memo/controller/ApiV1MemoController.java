package com.project4.DailyTask.domain.memo.controller;

import com.project4.DailyTask.domain.memo.dtio.*;
import com.project4.DailyTask.domain.memo.service.ApiV1MemoService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ApiV1MemoController {

    private final ApiV1MemoService memoService;

    @PostMapping("/teams/{teamId}/memos")
    public ResponseEntity<ApiResponse<CreateMemoRes>> createMemo(@PathVariable Long teamId,
                                                                 @AuthenticationPrincipal SecurityUser user,
                                                                 @RequestBody CreateMemoReq req){
        CreateMemoRes res = memoService.createMemo(teamId, user, req);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(res));
    }

    @GetMapping("/teams/{teamId}/memos")
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

    @GetMapping("/memos/{memoId}")
    public ResponseEntity<ApiResponse<MemoRes>> getMemo(@PathVariable Long memoId,
                                                        @AuthenticationPrincipal SecurityUser user){

        MemoRes memoRes = memoService.getMemo(memoId, user);

        return ResponseEntity.ok(ApiResponse.ok(memoRes));
    }

    @PatchMapping("/memos/{memoId}")
    public ResponseEntity<ApiResponse<UpdateMemoRes>> updateMemo(@PathVariable Long memoId,
                                                                 @AuthenticationPrincipal SecurityUser user,
                                                                 @RequestBody UpdateMemoReq req){
        UpdateMemoRes res = memoService.updateMemo(req, memoId, user);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }


    @DeleteMapping("/memos/{memoId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteMemo(@PathVariable Long memoId,
                                                           @AuthenticationPrincipal SecurityUser user){
        memoService.deleteMemo(memoId,user);

        return ResponseEntity.ok(ApiResponse.ok(true));
    }

}
