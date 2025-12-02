package com.project4.DailyTask.domain.user.service;

import com.project4.DailyTask.domain.user.dto.SignupRequestDto;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User signup(SignupRequestDto req){

        if(userRepository.findByEmail(req.getEmail()).isPresent()){
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .loginId(req.getLoginId())
                .password(passwordEncoder.encode(req.getPassword()))
                .nickname(req.getNickname())
                .email(req.getEmail())
                .profile_url("example")
                .status(Status.ACTIVE)
                .role(UserRole.USER)
                .build();

        return userRepository.save(user);
    }

    public boolean existsByEmail(String email){
        return userRepository.existsByEmail(email);
    }
    public boolean existsByLoginId(String loginId){
        return userRepository.existsByLoginId(loginId);
    }

    public User findById(Long id){
        return userRepository.findById(id)
                .orElseThrow(()-> new ApiException(ErrorCode.USER_NOT_FOUND));
    }
}
