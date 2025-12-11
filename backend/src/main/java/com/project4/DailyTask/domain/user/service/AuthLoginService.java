package com.project4.DailyTask.domain.user.service;

import com.project4.DailyTask.domain.user.dto.LoginRequestDto;
import com.project4.DailyTask.domain.user.dto.TokenResponseDto;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthLoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    @Transactional
    public TokenResponseDto login(LoginRequestDto req) {
        String identifier = req.getLoginId();

        Optional<User> userOptional = identifier.contains("@")
                ? userRepository.findByEmail(identifier)
                : userRepository.findByLoginId(identifier);
        User user = userOptional
                .orElseThrow(()-> new ApiException(ErrorCode.INVALID_LOGIN_ID));

        if(!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }

        String accessToken = authTokenService.genAccessToken(user);
        String refreshToken = authTokenService.genRefreshToken(user);

        user.setRefreshToken(refreshToken);

        return new TokenResponseDto(accessToken, refreshToken);
    }

    @Transactional
    public void logout(User user){
        user.setRefreshToken(null);
    }

    @Transactional
    public TokenResponseDto refreshToken(String refreshToken){
        if(!authTokenService.isValid(refreshToken)){
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .filter(u -> u.getRefreshToken().equals(refreshToken))
                .orElseThrow(()-> new ApiException(ErrorCode.INVALID_TOKEN));

        String newAccessToken = authTokenService.genAccessToken(user);
        String newRefreshToken = authTokenService.genRefreshToken(user);

        user.setRefreshToken(newRefreshToken);

        return new TokenResponseDto(newAccessToken, newRefreshToken);
    }

    public User getUserFromAccessToken(String accessToken){
        if(!authTokenService.isValid(accessToken)) {
            return null;
        }

        Map<String, Object> payload = authTokenService.payload(accessToken);
        if (payload == null) return null;

        long userId = ((Number) payload.get("userId")).longValue();
        String email = (String) payload.get("email");
        String nickname = (String) payload.get("nickname");
        String roleString = (String) payload.get("role");
        UserRole role = UserRole.valueOf(roleString);

        return User.builder()
                .id(userId)
                .email(email)
                .nickname(nickname)
                .role(role)
                .build();
    }

    public Optional<User> findByRefreshToken(String refreshToken){
        return userRepository.findByRefreshToken(refreshToken);
    }
}
