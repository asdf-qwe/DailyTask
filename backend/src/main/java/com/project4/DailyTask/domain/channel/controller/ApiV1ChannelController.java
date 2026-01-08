package com.project4.DailyTask.domain.channel.controller;

import com.project4.DailyTask.domain.channel.dto.ChannelListRes;
import com.project4.DailyTask.domain.channel.dto.CreateChannelReq;
import com.project4.DailyTask.domain.channel.dto.CreateChannelRes;
import com.project4.DailyTask.domain.channel.service.ApiV1ChannelService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/teams")
public class ApiV1ChannelController {
    private final ApiV1ChannelService channelService;


    @PostMapping("/{teamId}/channels")
    public ResponseEntity<ApiResponse<CreateChannelRes>> createChannel(@PathVariable Long teamId,
                                          @AuthenticationPrincipal SecurityUser user,
                                          @RequestBody CreateChannelReq req){
        CreateChannelRes res = channelService.createChannel(teamId, user, req);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(res));
    }

    @GetMapping("/{teamId}/channels")
    public ResponseEntity<ApiResponse<List<ChannelListRes>>> getChannels(
            @PathVariable Long teamId,
            @AuthenticationPrincipal SecurityUser user) {

        return ResponseEntity.ok(
                ApiResponse.ok(channelService.getChannelList(teamId, user))
        );
    }
}
