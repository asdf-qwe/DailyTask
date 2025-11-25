package com.project4.DailyTask.global.security.auth;


import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(this::createUserDetails)
                .orElseThrow(()-> new IllegalArgumentException("유저를 찾을 수 없습니다."));
    }

    private UserDetails createUserDetails(User user){
        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getNickname(),
                user.getRole(),
                user.getAuthorities()

        );
    }
}
