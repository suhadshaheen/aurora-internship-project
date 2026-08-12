package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.auth.LoginRequest;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.JwtService;
import com.aurora.info_hub.service.PasswordResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private PasswordResetService passwordResetService;

    // JwtAuthenticationFilter (loaded automatically by @WebMvcTest as part of
    // the security filter chain) depends on JwtService and
    // CustomUserDetailsService, which are @Service beans not loaded by the
    // @WebMvcTest slice. We mock both here just to satisfy the filter's
    // constructor so the context can load. JwtService is also a direct
    // constructor dependency of AuthController itself (used to generate the
    // token on successful login).
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private User sampleUser() {
        return User.builder()
                .id(1L)
                .userHandle("john")
                .email("john@example.com")
                .password("encoded-pass")
                .role("EMPLOYEE")
                .deleted(false)
                .build();
    }

    private LoginRequest validRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("secret123");
        return request;
    }

    // ---------- POST /auth/login ----------

    @Test
    @WithMockUser
    void login_shouldReturn200AndToken_onValidCredentials() throws Exception {
        User user = sampleUser();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userHandle").value("john"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    @WithMockUser
    void login_shouldAuthenticateWithTheExactEmailAndPasswordProvided() throws Exception {
        User user = sampleUser();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())));

        verify(authenticationManager).authenticate(
                argThat(token ->
                        token instanceof UsernamePasswordAuthenticationToken
                                && "john@example.com".equals(token.getPrincipal())
                                && "secret123".equals(token.getCredentials())));
    }

    @Test
    @WithMockUser
    void login_shouldReturn400_whenEmailIsBlank() throws Exception {
        LoginRequest request = validRequest();
        request.setEmail("");

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());

        verifyNoInteractions(authenticationManager);
    }

    @Test
    @WithMockUser
    void login_shouldReturn400_whenEmailFormatIsInvalid() throws Exception {
        LoginRequest request = validRequest();
        request.setEmail("not-an-email");

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @WithMockUser
    void login_shouldReturn400_whenPasswordIsBlank() throws Exception {
        LoginRequest request = validRequest();
        request.setPassword("");

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());

        verifyNoInteractions(authenticationManager);
    }

    @Test
    @WithMockUser
    void login_shouldReturn401_whenCredentialsAreInvalid() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Incorrect email or password. Please try again."));

        verifyNoInteractions(jwtService);
    }

    @Test
    @WithMockUser
    void login_shouldReturn400_whenBodyIsMalformedJson() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-valid-json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(authenticationManager);
    }
}