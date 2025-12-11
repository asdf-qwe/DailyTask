package com.project4.DailyTask.domain.message.service;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.service.AuthLoginService;
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

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final AuthLoginService authLoginService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new ApiException(ErrorCode.INVALID_TOKEN);
            }

            String accessToken = authHeader.substring("Bearer ".length());

            User user = authLoginService.getUserFromAccessToken(accessToken);

            GrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
            List<GrantedAuthority> authorities = List.of(authority);

            SecurityUser securityUser = new SecurityUser(
                    user.getId(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getNickname(),
                    user.getRole(),
                    authorities
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    securityUser,
                    null,
                    authorities
            );

            accessor.setUser(authentication);
        }

        return message;
    }
}

