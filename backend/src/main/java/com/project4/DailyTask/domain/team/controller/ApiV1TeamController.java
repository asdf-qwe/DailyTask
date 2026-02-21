package com.project4.DailyTask.domain.team.controller;

import com.project4.DailyTask.domain.team.dto.*;
import com.project4.DailyTask.domain.team.service.ApiV1TeamService;
import com.project4.DailyTask.domain.team.service.TeamPerfService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/teams")
public class ApiV1TeamController {
    private final ApiV1TeamService teamService;
    private final TeamPerfService teamPerfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GetTeamRes>>> getTeam(@AuthenticationPrincipal SecurityUser user) {

        List<GetTeamRes> res = teamService.getTeam(user);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateTeamResponse>> createTeam(@Valid @RequestBody CreateTeamRequest dto,
                                                                      @AuthenticationPrincipal SecurityUser user) {
        CreateTeamResponse response = teamService.createTeam(dto, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/{teamId}/invite-code")
    public ResponseEntity<ApiResponse<InviteCodeResponse>> createCode(@PathVariable Long teamId,
                                                                      @AuthenticationPrincipal SecurityUser user,
                                                                      @RequestBody CreateInviteCodeRequest dto) {
        InviteCodeResponse response = teamService.createInviteCode(teamId, user, dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<JoinTeamResponse>> joinTeam(@RequestBody JoinTeamRequest dto,
                                                                  @AuthenticationPrincipal SecurityUser user) {
        JoinTeamResponse response = teamService.joinTeam(dto, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<ApiResponse<UpdateTeamRes>> updateTeam(@RequestBody UpdateTeamReq req,
                                                                 @AuthenticationPrincipal SecurityUser user,
                                                                 @PathVariable Long teamId) {

        UpdateTeamRes res = teamService.updateTeam(teamId, user, req);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PatchMapping("/{teamId}/leave")
    public ResponseEntity<ApiResponse<Boolean>> leftTeam(@PathVariable Long teamId,
                                                         @AuthenticationPrincipal SecurityUser user) {
        teamService.leftTeam(teamId, user);

        return ResponseEntity.ok(ApiResponse.ok(true));

    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<List<TeamMemberListRes>>> getTeamMemberList(@PathVariable Long teamId,
                                                                                  @AuthenticationPrincipal SecurityUser user) {
        List<TeamMemberListRes> memberListRes = teamService.getTeamMembers(teamId, user);

        return ResponseEntity.ok(ApiResponse.ok(memberListRes));
    }

    @PatchMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteMember(@PathVariable Long teamId,
                                                             @PathVariable Long userId,
                                                             @AuthenticationPrincipal SecurityUser user) {

        teamService.deleteMember(teamId, user, userId);

        return ResponseEntity.ok(ApiResponse.ok(true));
    }

    @PatchMapping("/{teamId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteTeam(@PathVariable Long teamId,
                                                           @AuthenticationPrincipal SecurityUser user){

        teamService.deleteTeam(teamId, user);

        return ResponseEntity.ok(ApiResponse.ok(true));
    }

    @GetMapping("/nplus1")
    @Profile("perf")
    public ResponseEntity<ApiResponse<List<TeamListRes>>> teamsNPlusOne()
    {
        return ResponseEntity.ok(ApiResponse.ok(teamPerfService.listTeamsNPlusOne()));
    }

    @GetMapping("/fetch-join")
    @Profile("perf")
    public ResponseEntity<ApiResponse<List<TeamListRes>>> teamsFetchJoin() {
        return ResponseEntity.ok(ApiResponse.ok(teamPerfService.listTeamsFetchJoin()));
    }
}
