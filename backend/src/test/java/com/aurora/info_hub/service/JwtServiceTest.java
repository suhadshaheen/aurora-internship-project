package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Date;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "this-is-a-test-secret-key-that-is-long-enough-for-hs256";

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", 3600000L); // 1 hour

        userDetails = User.builder()
                .id(1L)
                .userHandle("suhad_sh")
                .email("suhad@auroratech.ps")
                .role("EMPLOYEE")
                .build();
    }


    @Test
    @DisplayName("test valid generate token returns a non-null non-blank token")
    void generateTokenReturnsToken() {
        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("test valid generate token has three parts separated by dots")
    void generateTokenHasCorrectStructure() {
        String token = jwtService.generateToken(userDetails);

        assertThat(token.split("\\.")).hasSize(3);
    }


    @Test
    @DisplayName("test valid extract username returns the correct email")
    void extractUsernameReturnsCorrectEmail() {
        String token = jwtService.generateToken(userDetails);

        String extractedUsername = jwtService.extractUsername(token);

        assertThat(extractedUsername).isEqualTo("suhad@auroratech.ps");
    }

    @Test
    @DisplayName("test invalid extract username throws when token is malformed")
    void extractUsernameThrowsWhenTokenIsMalformed() {
        assertThatThrownBy(() -> jwtService.extractUsername("not.a.valid.jwt.token")).isInstanceOf(io.jsonwebtoken.MalformedJwtException.class);
    }

    @Test
    @DisplayName("test invalid extract username throws when token is signed with a different secret")
    void extractUsernameThrowsWhenSignedWithDifferentSecret() {
        JwtService otherService = new JwtService();
        ReflectionTestUtils.setField(otherService, "secret", "a-completely-different-secret-key-value-here");
        ReflectionTestUtils.setField(otherService, "expiration", 3600000L);

        String tokenFromOtherService = otherService.generateToken(userDetails);

        assertThatThrownBy(() -> jwtService.extractUsername(tokenFromOtherService)).isInstanceOf(SignatureException.class);
    }

    @Test
    @DisplayName("test invalid extract username throws when token is expired")
    void extractUsernameThrowsWhenTokenIsExpired() {
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L); // already expired

        String expiredToken = jwtService.generateToken(userDetails);

        assertThatThrownBy(() -> jwtService.extractUsername(expiredToken)).isInstanceOf(ExpiredJwtException.class);
    }


    @Test
    @DisplayName("test valid extract claim returns the expiration date")
    void extractClaimReturnsExpirationDate() {
        String token = jwtService.generateToken(userDetails);

        Date expiration = jwtService.extractClaim(token, claims -> claims.getExpiration());

        assertThat(expiration).isAfter(new Date());
    }

    @Test
    @DisplayName("test valid extract claim returns the issued at date")
    void extractClaimReturnsIssuedAtDate() {
        String token = jwtService.generateToken(userDetails);

        Date issuedAt = jwtService.extractClaim(token, claims -> claims.getIssuedAt());

        assertThat(issuedAt).isBeforeOrEqualTo(new Date());
    }


    @Test
    @DisplayName("test valid isTokenValid returns true for a matching valid token")
    void isTokenValidReturnsTrueForValidToken() {
        String token = jwtService.generateToken(userDetails);

        boolean result = jwtService.isTokenValid(token, userDetails);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("test invalid isTokenValid returns false when username does not match")
    void isTokenValidReturnsFalseWhenUsernameDoesNotMatch() {
        String token = jwtService.generateToken(userDetails);

        UserDetails differentUser = User.builder().id(2L)
                .userHandle("other_user")
                .email("other@auroratech.ps")
                .role("EMPLOYEE")
                .build();

        boolean result = jwtService.isTokenValid(token, differentUser);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("test invalid isTokenValid throws when token is expired")
    void isTokenValidThrowsWhenTokenIsExpired() {
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);

        String expiredToken = jwtService.generateToken(userDetails);

        assertThatThrownBy(() -> jwtService.isTokenValid(expiredToken, userDetails)).isInstanceOf(ExpiredJwtException.class);
    }
}