package com.project4.DailyTask.domain.user.controller;

import com.project4.DailyTask.domain.user.dto.LoginRequestDto;
import com.project4.DailyTask.domain.user.dto.SignupRequestDto;
import com.project4.DailyTask.domain.user.dto.TokenResponseDto;
import com.project4.DailyTask.domain.user.dto.UserResponseDto;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.service.AuthLoginService;
import com.project4.DailyTask.domain.user.service.UserService;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.rq.Rq;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class ApiV1UserController {

    private final UserService userService;
    private final AuthLoginService authLoginService;

    private final Rq rq;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Valid @RequestBody SignupRequestDto request){
        User user = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(UserResponseDto.fromEntity(user)));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email){
        boolean exists = userService.existsByEmail(email);

        if(!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.ok(ErrorCode.INVALID_USER_EMAIL));
        }

        if(exists){
            return ResponseEntity.status(409).body(ApiResponse.ok(ErrorCode.EMAIL_ALREADY_EXISTS));
        }
        return ResponseEntity.ok(ApiResponse.ok("사용 가능한 이메일입니다."));
    }

    @GetMapping("/check-loginId")
    public ResponseEntity<?> checkLoginId(@RequestParam String loginId){
        boolean exists = userService.existsByLoginId(loginId);

        if (exists) {
            return ResponseEntity.status(409).body(ApiResponse.ok("이미 사용 중인 아이디입니다"));
        }
        return ResponseEntity.ok(ApiResponse.ok("사용 가능한 아이디입니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponseDto>> login(@Valid @RequestBody LoginRequestDto req,
                                                               HttpServletResponse res){
        TokenResponseDto tokenDto = authLoginService.login(req);

        String accessCookie = "accessToken=" + tokenDto.getAccessToken()
                + "; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax";
        String refreshCookie = "refreshToken=" + tokenDto.getRefreshToken()
                + "; HttpOnly; Path=/; Max-Age=" + (60 * 60 * 24 * 7) + "; SameSite=Lax";

        res.addHeader("Set-Cookie", accessCookie);
        res.addHeader("Set-Cookie", refreshCookie);

        return ResponseEntity.ok(ApiResponse.ok(tokenDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(){
        User user = rq.getActor();
        if(user != null) authLoginService.logout(user);

        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");
        rq.deleteCookie("'JSESSIONID");
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponseDto>> refresh(@CookieValue("refreshToken") String refreshToken) {
        TokenResponseDto response = authLoginService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMyProfile() {
        try{
            User user = rq.getActor();

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(ApiResponse.ok(UserResponseDto.fromEntity(user)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.ok("서버 에러 발생: " + e.getMessage()));
        }
    }
}
