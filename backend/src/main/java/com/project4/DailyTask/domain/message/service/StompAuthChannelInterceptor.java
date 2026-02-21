package com.project4.DailyTask.domain.message.service;

import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.service.AuthTokenService;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final AuthTokenService authTokenService;
    private final TeamMemberChecker teamMemberChecker;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand cmd = accessor.getCommand();
        if (cmd == null) return message;

        if (StompCommand.CONNECT.equals(cmd)) {
            authenticateOnConnect(accessor);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(cmd) || StompCommand.SEND.equals(cmd)) {
            Long userId = extractUserId(accessor);
            Long teamId = parseTeamId(accessor.getDestination());
            teamMemberChecker.requireJoined(teamId, userId);
        }

        return message;
    }

    private void authenticateOnConnect(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        String accessToken = authHeader.substring("Bearer ".length());

        if (!authTokenService.isValid(accessToken)) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        Map<String, Object> payload = authTokenService.payload(accessToken);
        if (payload == null) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        Object userIdObj = payload.get("userId");
        Object roleObj = payload.get("role");

        if (userIdObj == null || roleObj == null) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        long userId = ((Number) userIdObj).longValue();

        UserRole role;
        try {
            role = UserRole.valueOf(roleObj.toString());
        } catch (IllegalArgumentException e) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userId,
                null,
                authorities
        );

        accessor.setUser(authentication);
    }

    private Long extractUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        if (!(accessor.getUser() instanceof Authentication authentication)) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Long userId) {
            return userId;
        }

        if (principal instanceof String s) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException e) {
                throw new ApiException(ErrorCode.INVALID_TOKEN);
            }
        }

        throw new ApiException(ErrorCode.INVALID_TOKEN);
    }

    private Long parseTeamId(String destination) {
        if (destination == null || destination.isBlank()) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        String[] parts = destination.split("/");

        if (parts.length < 6) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        if (!"team".equals(parts[2])) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        try {
            return Long.parseLong(parts[3]);
        } catch (NumberFormatException e) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }
    }
}

