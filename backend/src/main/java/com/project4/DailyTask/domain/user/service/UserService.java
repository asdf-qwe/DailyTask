package com.project4.DailyTask.domain.user.service;

import com.project4.DailyTask.domain.user.dto.SignupRequestDto;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User signup(SignupRequestDto req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByLoginId(req.loginId())) {
            throw new ApiException(ErrorCode.LOGIN_ID_ALREADY_EXISTS);
        }

        User user = User.createNew(
                req.loginId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.nickname()
        );

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public void checkEmailAvailable(String email) {
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new ApiException(ErrorCode.INVALID_USER_EMAIL);
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    @Transactional(readOnly = true)
    public void checkLoginIdAvailable(String loginId) {
        if (userRepository.existsByLoginId(loginId)) {
            throw new ApiException(ErrorCode.LOGIN_ID_ALREADY_EXISTS);
        }
    }

    @Transactional(readOnly = true)
    public User findByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    public void withdraw(SecurityUser principal) {
        User user = findByIdOrThrow(principal.getId());
        user.withdraw(LocalDateTime.now());
    }
}
