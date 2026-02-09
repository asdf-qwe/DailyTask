package com.project4.DailyTask.global.rq;

import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
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
    private final UserService userService; // DB 유저가 필요할 때만 사용

    @Value("${custom.site.cookie.secure}")
    private boolean cookieSecure;

    @Value("${custom.site.cookie.sameSite}")
    private String cookieSameSite;

    public SecurityUser getPrincipal() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getPrincipal)
                .filter(p -> p instanceof SecurityUser)
                .map(p -> (SecurityUser) p)
                .orElse(null);
    }

    public User getActor() {
        SecurityUser principal = getPrincipal();
        if (principal == null) return null;
        return userService.findByIdOrThrow(principal.getId());
    }

    public String getCookieValue(String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;

        for (Cookie c : cookies) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    public void setCookie(String name, String value) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .httpOnly(true)
                .build();

        res.addHeader("Set-Cookie", cookie.toString());
    }

    public void setCookie(String name, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .maxAge(maxAgeSeconds)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .httpOnly(true)
                .build();

        res.addHeader("Set-Cookie", cookie.toString());
    }

    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .path("/")
                .maxAge(0)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .httpOnly(true)
                .build();

        res.addHeader("Set-Cookie", cookie.toString());
    }

    public void setHeader(String name, String value) {
        res.setHeader(name, value);
    }

    public String getHeader(String name) {
        return req.getHeader(name);
    }
}
