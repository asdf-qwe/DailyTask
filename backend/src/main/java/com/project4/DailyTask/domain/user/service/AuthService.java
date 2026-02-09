package com.project4.DailyTask.domain.user.service;

import com.project4.DailyTask.domain.user.dto.LoginRequestDto;
import com.project4.DailyTask.domain.user.dto.TokenResponseDto;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public TokenResponseDto login(LoginRequestDto req) {
        String identifier = req.loginId();

        User user = (identifier.contains("@")
                ? userRepository.findByEmail(identifier)
                : userRepository.findByLoginId(identifier)
        ).orElseThrow(() -> new ApiException(ErrorCode.INVALID_LOGIN_ID));

        if (user.isDeleted()) throw new ApiException(ErrorCode.WITHDRAW_USER);
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }

        String access = authTokenService.genAccessToken(user);
        String refresh = authTokenService.genRefreshToken(user);

        user.updateRefreshToken(refresh);

        return new TokenResponseDto(access, refresh);
    }

    public void logout(SecurityUser principal) {
        if (principal == null) return;
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        user.updateRefreshToken(null);
    }

    public TokenResponseDto refresh(String refreshToken) {
        if (!authTokenService.isValid(refreshToken)) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        Map<String, Object> payload = authTokenService.payload(refreshToken);
        if (payload == null || payload.get("userId") == null) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        long userId = ((Number) payload.get("userId")).longValue();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_TOKEN));

        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }
        if (user.isDeleted()) throw new ApiException(ErrorCode.WITHDRAW_USER);

        String newAccess = authTokenService.genAccessToken(user);
        String newRefresh = authTokenService.genRefreshToken(user);
        user.updateRefreshToken(newRefresh);

        return new TokenResponseDto(newAccess, newRefresh);
    }
}
