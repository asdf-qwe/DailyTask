package com.project4.DailyTask.domain.message.controller;


import com.project4.DailyTask.domain.message.dto.MessageRes;
import com.project4.DailyTask.domain.message.dto.SendMessageDto;
import com.project4.DailyTask.domain.message.service.ApiV1MessageService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class ApiV1MessageController {
    private final ApiV1MessageService messageService;


    @MessageMapping("/channel/{channelId}")
    public void handleRoomMessage(@DestinationVariable Long channelId,
                                  @AuthenticationPrincipal SecurityUser user,
                                  SendMessageDto messageDto) {
        messageService.sendMessage(channelId, user, messageDto);
    }


    @GetMapping("/api/channel/{channelId}/messages")
    public ResponseEntity<ApiResponse<List<MessageRes>>> getChatHistory(@PathVariable Long channelId,
                                                                        @AuthenticationPrincipal SecurityUser user) {
        List<MessageRes> messageDto = messageService.getChatHistory(channelId, user);
        return ResponseEntity.ok(ApiResponse.ok(messageDto));
    }
}
