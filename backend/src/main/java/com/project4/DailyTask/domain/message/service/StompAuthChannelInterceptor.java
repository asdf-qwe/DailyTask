package com.project4.DailyTask.domain.message.service;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.service.AuthTokenService;
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

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        if (!StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

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

        // role은 AuthTokenService에서 role.name()으로 넣는 전제
        UserRole role;
        try {
            role = UserRole.valueOf(roleObj.toString());
        } catch (IllegalArgumentException e) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

        // STOMP CONNECT 인증에서는 email/nickname/password가 필요 없음 (null 허용)
        SecurityUser securityUser = new SecurityUser(
                userId,
                null,
                null,
                null,
                role,
                authorities
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                securityUser,
                null,
                authorities
        );

        accessor.setUser(authentication);

        return message;
    }
}
