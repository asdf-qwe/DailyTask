package com.project4.DailyTask.global.security.filter;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.entity.UserRole;
import com.project4.DailyTask.domain.user.service.AuthTokenService;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.rq.Rq;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;
    private final AuthTokenService authTokenService;

    private record AccessToken(String value) {}

    private AccessToken extractAccessToken() {

        String authorization = rq.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return new AccessToken(authorization.substring("Bearer ".length()));
        }


        String accessToken = rq.getCookieValue("accessToken");
        if (accessToken != null && !accessToken.isBlank()) {
            return new AccessToken(accessToken);
        }

        return null;
    }

    private boolean isPublicPath(String uri) {

        return List.of(
                "/api/v1/users/signup",
                "/api/v1/auth/login",
                "/api/v1/auth/refresh"
        ).contains(uri);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();

        // API 아니면 패스
        if (!uri.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 공개 엔드포인트는 인증 시도 자체를 생략(불필요한 파싱/로그 방지)
        if (isPublicPath(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            AccessToken token = extractAccessToken();
            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (!authTokenService.isValid(token.value())) {
                // invalid면 쿠키 청소(선택)
                rq.deleteCookie("accessToken");
                // refreshToken까지 지울지는 정책 선택인데,
                // 보통 access만 invalid일 때 refresh까지 날리면 UX 나빠질 수 있어.
                // rq.deleteCookie("refreshToken");
                filterChain.doFilter(request, response);
                return;
            }

            Map<String, Object> payload = authTokenService.payload(token.value());
            if (payload == null || payload.get("userId") == null || payload.get("role") == null) {
                rq.deleteCookie("accessToken");
                filterChain.doFilter(request, response);
                return;
            }

            long userId = ((Number) payload.get("userId")).longValue();
            UserRole role = UserRole.valueOf(payload.get("role").toString());

            List<GrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

            // AccessToken claim을 최소화했으니 email/nickname은 null로 둠
            SecurityUser principal = new SecurityUser(
                    userId,
                    null,
                    null,
                    null,
                    role,
                    authorities
            );

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    authorities
            );

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            // 토큰 파싱/role 변환 등에서 터지면 그냥 익명 처리 + 쿠키 청소(선택)
            rq.deleteCookie("accessToken");
        }

        filterChain.doFilter(request, response);
    }
}
