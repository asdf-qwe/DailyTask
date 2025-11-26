package com.project4.DailyTask.domain.team.controller;

import com.project4.DailyTask.domain.team.dto.*;
import com.project4.DailyTask.domain.team.service.ApiV1TeamService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/teams")
public class ApiV1TeamController {
    private final ApiV1TeamService teamService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateTeamResponse>> createTeam(@RequestBody CreateTeamRequest dto,
                                                                      @AuthenticationPrincipal SecurityUser user){
        CreateTeamResponse response = teamService.createTeam(dto, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/{teamId}/invite-code")
    public ResponseEntity<ApiResponse<InviteCodeResponse>> CreateCode(@PathVariable Long teamId,
                                                                    @AuthenticationPrincipal SecurityUser user,
                                                                    @RequestBody CreateInviteCodeRequest dto){
        InviteCodeResponse response = teamService.createInviteCode(teamId,user,dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<JoinTeamResponse>> JoinTeam(@RequestBody JoinTeamRequest dto,
                                                                  @AuthenticationPrincipal SecurityUser user){
        JoinTeamResponse response = teamService.joinTeam(dto, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<ApiResponse<UpdateTeamRes>> UpdateTeam(@RequestBody UpdateTeamReq req,
                                                                 @AuthenticationPrincipal SecurityUser user,
                                                                 @PathVariable Long teamId){

        UpdateTeamRes res = teamService.updateTeam(teamId, user, req);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }
}
