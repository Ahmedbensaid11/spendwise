package com.spendwise.backend.auth;

import com.spendwise.backend.user.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;
    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        if (secret.length() < 32) throw new IllegalArgumentException("JWT secret must be at least 32 characters");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }
    public String generate(User user) {
        Instant now = Instant.now();
        return Jwts.builder().subject(user.getEmail()).issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs))).signWith(key).compact();
    }
    public String extractEmail(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject(); }
}
