package com.project4.DailyTask.global.rq;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.service.AuthLoginService;
import com.project4.DailyTask.domain.user.service.AuthTokenService;
import com.project4.DailyTask.domain.user.service.UserService;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.Optional;

@RequestScope
@Component
@RequiredArgsConstructor
public class Rq {
    private final HttpServletRequest req;
    private final HttpServletResponse res;
    private final AuthTokenService authTokenService;
    private final AuthLoginService authLoginService;
    private final UserService userService;

    @Value("${custom.site.cookie.secure}")
    private boolean cookieSecure;

    @Value("${custom.site.cookie.sameSite}")
    private String cookieSameSite;

    public User getUserFromAccessToken(String accessToken){
        try {
            return authLoginService.getUserFromAccessToken(accessToken);
        } catch (Exception e){
            return null;
        }
    }

    public void setLogin(User user){
        try {
            UserDetails userDetails = new SecurityUser(
                    user.getId(),
                    user.getEmail(),
                    "",
                    user.getNickname(),
                    user.getRole(),
                    user.getAuthorities()
            );

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }catch (Exception e){
            throw new ApiException(ErrorCode.INVALID_INVITE_CODE);
        }
    }

    public User getActor(){
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getPrincipal)
                .filter(p -> p instanceof SecurityUser)
                .map(p -> (SecurityUser) p)
                .map(su -> userService.findById(su.getId()))
                .orElse(null);
    }
    // 요청이 들어올 시 시큐리티 컨텍스트 안에 Authentication을 가져와 principal(유저정보)만 빼서 실제
    // securityUser와 맞는지 검증하고 principal을 securityuser로 캐스팅한 후 해당 id로 실제 db유저를 찾는 메서드

    public String getCookieValue(String name){
        return Optional.ofNullable(req.getCookies())
                .stream()
                .flatMap(Arrays::stream)
                .filter(cookie -> cookie.getName().equals(name))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public void setCookie(String name, String value){
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .httpOnly(true)
                .build();

        res.addHeader("Set-Cookie", cookie.toString());
    }

    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .maxAge(0)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .httpOnly(true)
                .build();

        res.addHeader("Delete-Cookie", cookie.toString());
    }

    public String makeAuthCookies(User user) {
        String accessToken = authTokenService.genAccessToken(user);

        setCookie("accessToken", accessToken);
        setCookie("refreshToken", user.getRefreshToken());

        return accessToken;
    }

    public void setHeader(String name, String value) {
        res.setHeader(name, value);
    }

    public String getHeader(String name){
        return req.getHeader(name);
    }

    public void refreshAccessToken(User user){
        String newToken = authTokenService.genAccessToken(user);
        setHeader("Authorization", "Bearer" + newToken);
        setCookie("accessToken", newToken);
    }

    public User refreshAccessTokenByRefreshToken(String refreshToken){
        return authLoginService.findByRefreshToken(refreshToken)
                .map(u -> {
                    refreshAccessToken(u);
                    return u;
                })
                .orElse(null);
    }
}
