package com.project4.DailyTask.global.filter;

import jakarta.persistence.EntityManagerFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Profile({"test"})
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final long SLOW_THRESHOLD_MS = 300;

    private final Statistics statistics;

    public RequestLoggingFilter(EntityManagerFactory emf) {
        SessionFactory sf = emf.unwrap(SessionFactory.class);
        this.statistics = sf.getStatistics();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startNs = System.nanoTime();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();

        statistics.clear();

        log.info("HTTP_REQ method={} uri={}{}", method, uri, (query == null ? "" : "?" + query));

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startNs) / 1_000_000;
            int status = response.getStatus();

            long queryCount = statistics.getPrepareStatementCount();

            if (durationMs >= SLOW_THRESHOLD_MS) {
                log.warn("SLOW_HTTP method={} uri={} status={} durationMs={} queryCount={}",
                        method, uri, status, durationMs, queryCount);
            } else {
                log.info("HTTP_RES method={} uri={} status={} durationMs={} queryCount={}",
                        method, uri, status, durationMs, queryCount);
            }
        }
    }
}
