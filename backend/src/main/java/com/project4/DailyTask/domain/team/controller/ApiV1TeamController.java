package com.project4.DailyTask.domain.team.controller;

import com.project4.DailyTask.domain.team.dto.CreateTeamRequest;
import com.project4.DailyTask.domain.team.dto.CreateTeamResponse;
import com.project4.DailyTask.domain.team.service.ApiV1TeamService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
