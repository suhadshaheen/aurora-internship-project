package com.aurora.info_hub.security;

import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtService, customUserDetailsService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private UserDetails mockUserDetails(String username, String role) {
        UserDetails userDetails = mock(UserDetails.class);
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        // Use lenient-friendly doReturn since not every test asserts on these.
        lenient().when(userDetails.getUsername()).thenReturn(username);
        lenient().doReturn(authorities).when(userDetails).getAuthorities();
        return userDetails;
    }

    // ---------- No / malformed Authorization header ----------

    @Test
    void doFilterInternal_shouldSkipAuthentication_whenNoAuthorizationHeader() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService, customUserDetailsService);
    }

    @Test
    void doFilterInternal_shouldSkipAuthentication_whenHeaderDoesNotStartWithBearer() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic somecredentials");

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService, customUserDetailsService);
    }

    @Test
    void doFilterInternal_shouldSkipAuthentication_whenHeaderIsEmptyString() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("");

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService, customUserDetailsService);
    }

    @Test
    void doFilterInternal_shouldNotCrash_whenBearerPrefixHasNoTokenAfterIt() throws Exception {
        // "Bearer " with nothing after it -> substring(7) yields "".
        when(request.getHeader("Authorization")).thenReturn("Bearer ");
        when(jwtService.extractUsername("")).thenThrow(new JwtException("Empty token"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService).extractUsername("");
        verify(filterChain).doFilter(request, response);
    }

    // ---------- Valid token ----------

    @Test
    void doFilterInternal_shouldAuthenticate_whenTokenIsValid() throws Exception {
        UserDetails userDetails = mockUserDetails("john@example.com", "EMPLOYEE");

        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(jwtService.extractUsername("valid-token")).thenReturn("john@example.com");
        when(customUserDetailsService.loadUserByUsername("john@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-token", userDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
        assertThat(authentication.getAuthorities()).extracting("authority").contains("ROLE_EMPLOYEE");
        assertThat(authentication.getDetails()).isNotNull();

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldExtractTokenCorrectly_strippingBearerPrefix() throws Exception {
        UserDetails userDetails = mockUserDetails("john@example.com", "EMPLOYEE");

        when(request.getHeader("Authorization")).thenReturn("Bearer abc.def.ghi");
        when(jwtService.extractUsername("abc.def.ghi")).thenReturn("john@example.com");
        when(customUserDetailsService.loadUserByUsername("john@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("abc.def.ghi", userDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        verify(jwtService).extractUsername("abc.def.ghi");
        verify(jwtService).isTokenValid("abc.def.ghi", userDetails);
    }

    // ---------- Invalid / rejected token ----------

    @Test
    void doFilterInternal_shouldNotAuthenticate_whenTokenIsNotValid() throws Exception {
        UserDetails userDetails = mockUserDetails("john@example.com", "EMPLOYEE");

        when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
        when(jwtService.extractUsername("bad-token")).thenReturn("john@example.com");
        when(customUserDetailsService.loadUserByUsername("john@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("bad-token", userDetails)).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldNotAuthenticate_whenExtractedUsernameIsNull() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer weird-token");
        when(jwtService.extractUsername("weird-token")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(customUserDetailsService);
    }

    // ---------- Already-authenticated context ----------

    @Test
    void doFilterInternal_shouldNotOverwriteExistingAuthentication() throws Exception {
        Authentication existingAuth = mock(Authentication.class);
        SecurityContextHolder.getContext().setAuthentication(existingAuth);

        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(jwtService.extractUsername("valid-token")).thenReturn("john@example.com");

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existingAuth);
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(customUserDetailsService);
    }

    // ---------- Exception handling ----------

    @Test
    void doFilterInternal_shouldContinueChain_whenJwtExceptionIsThrown() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer malformed-token");
        when(jwtService.extractUsername("malformed-token"))
                .thenThrow(new JwtException("Malformed JWT"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldContinueChain_whenUserNotFound() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(jwtService.extractUsername("valid-token")).thenReturn("ghost@example.com");
        when(customUserDetailsService.loadUserByUsername("ghost@example.com"))
                .thenThrow(new UsernameNotFoundException("User not found"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldAlwaysCallFilterChainExactlyOnce_evenOnException() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
        when(jwtService.extractUsername("bad-token")).thenThrow(new JwtException("boom"));

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }
}