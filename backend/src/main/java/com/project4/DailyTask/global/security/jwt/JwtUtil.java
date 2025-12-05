package com.project4.DailyTask.global.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("{custom.jwt.secretKey}")
    private String rawSecret;

    private SecretKey secretKey;

    @PostConstruct
    public void init(){
        this.secretKey = Keys.hmacShaKeyFor(rawSecret.getBytes());
    }

    public String generateToken(long expiresSecond, Map<String, Object> claims){
        Date now = new Date();
        Date exp = new Date(now.getTime() + expiresSecond * 1000);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(exp)
                .signWith(secretKey)
                .compact();
    }

    public boolean isValid(String token){
        try{
            Jwts.parser().verifyWith(secretKey).build().parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> getPayload(String token) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            return claims.getPayload();
        } catch (Exception e) {
            return null;
        }
    }

}
