package com.project4.DailyTask.domain.user.service;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    private final JwtUtil jwtUtil;

    @Value("${custom.accessToken.expirationSeconds}")
    private long accessTokenExpirationSeconds;

    @Value("${custom.refreshToken.expirationSeconds}")
    private long refreshTokenExpirationSeconds;

    public String genAccessToken(User user){
        return jwtUtil.generateToken(
                accessTokenExpirationSeconds,
                Map.of(
                        "userId", user.getId(),
                        "email", user.getEmail(),
                        "nickname", user.getNickname(),
                        "role", user.getRole()
                )
        );
    }

    public String genRefreshToken(User user){
        return jwtUtil.generateToken(
                refreshTokenExpirationSeconds,
                Map.of(
                        "userId", user.getId(),
                        "email", user.getEmail()
                )
        );
    }

    public boolean isValid (String token){
        return jwtUtil.isValid(token);
    }

    public Map<String, Object> payload(String token){
        return jwtUtil.getPayload(token);
    }

}
