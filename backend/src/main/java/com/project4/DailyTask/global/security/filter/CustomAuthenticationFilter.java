package com.project4.DailyTask.global.security.filter;

import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.rq.Rq;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;

    private record AuthTokens(String refreshToken, String accessToken){}

    private AuthTokens getAuthTokensFromRequest(){
        String authorization = rq.getHeader("Authorization");

        if(authorization != null && authorization.startsWith("Bearer ")) {
            String accessToken = authorization.substring("Bearer ".length());
            return new AuthTokens(null, accessToken);
        }

        String refreshToken = rq.getCookieValue("refreshToken");
        String accessToken = rq.getCookieValue("accessToken");

        if(accessToken != null){
            return new AuthTokens(refreshToken, accessToken);
        }

        return null;
    }

    private User getUserFromAccessToken(String accessToken){
        return rq.getUserFromAccessToken(accessToken);
    }

    private User refreshAccessTokenByRefreshToken(String refreshToken){
        return rq.refreshAccessTokenByRefreshToken(refreshToken);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if(!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if(List.of(
                "/api/v1/users/signup",
                "/api/v1/users/login",
                "/api/v1/users/refresh"
        ).contains(request.getRequestURI())){
            filterChain.doFilter(request, response);
            return;
        }

        try {
            AuthTokens authTokens = getAuthTokensFromRequest();
            if(authTokens == null) {
                filterChain.doFilter(request, response);
                return;
            }
            String refreshToken = authTokens.refreshToken();
            String accessToken = authTokens.accessToken();

            User user = getUserFromAccessToken(accessToken);

            if (user == null && refreshToken != null){
                user = refreshAccessTokenByRefreshToken(refreshToken);
            }

            if(user != null) {
                rq.setLogin(user);
            }else {
                rq.deleteCookie("accessToken");
                rq.deleteCookie("refreshToken");
            }
        } catch (Exception e){
            throw new ApiException(ErrorCode.INVALID_TOKEN);
        }

        filterChain.doFilter(request, response);
    }
}
