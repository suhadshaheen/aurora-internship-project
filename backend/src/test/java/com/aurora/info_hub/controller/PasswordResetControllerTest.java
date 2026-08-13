package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.auth.ForgotPasswordRequest;
import com.aurora.info_hub.dto.auth.ResetPasswordRequest;
import com.aurora.info_hub.exception.ConflictException;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.security.JwtAuthenticationFilter;
import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.JwtService;
import com.aurora.info_hub.service.PasswordResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PasswordResetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private PasswordResetService passwordResetService;
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Test
    @DisplayName("test valid forgot password when email exists")
    void forgotPasswordWhenEmailExists() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@auroratech.ps");

        when(passwordResetService.requestPasswordReset("test@auroratech.ps")).thenReturn("Password reset link has been sent to your email.");

        mockMvc.perform(post("/auth/forgot-password").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request))).andExpect(status().isOk()).andExpect(jsonPath("$.message").value("Password reset link has been sent to your email."));
    }
    @Test
    @DisplayName("test invalid forgot password when email is blank")
    void forgotPasswordWhenEmailIsBlank() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("test invalid forgot password when email does not exist")
    void forgotPasswordWhenEmailDoesNotExist() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@auroratech.ps");

        doThrow(new NotFoundException("No account is registered with this email address."))
                .when(passwordResetService).requestPasswordReset("unknown@auroratech.ps");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }



    @Test
    @DisplayName("test valid reset password when data is correct")
    void resetPasswordWhenDataIsCorrect() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("NewPass123");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully."));
    }

    @Test
    @DisplayName("test invalid reset password when passwords do not match")
    void resetPasswordWhenPasswordsDoNotMatch() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("Pass1");
        request.setConfirmPassword("Pass2");

        doThrow(new IllegalArgumentException("Passwords do not match"))
                .when(passwordResetService).resetPassword("valid-token", "Pass1", "Pass2");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("test invalid reset password when token does not exist")
    void resetPasswordWhenTokenDoesNotExist() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-token");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("NewPass123");

        doThrow(new NotFoundException("Invalid reset token"))
                .when(passwordResetService).resetPassword("invalid-token", "NewPass123", "NewPass123");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("test invalid reset password when token already used")
    void resetPasswordWhenTokenAlreadyUsed() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("used-token");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("NewPass123");

        doThrow(new ConflictException("This reset link has already been used"))
                .when(passwordResetService).resetPassword("used-token", "NewPass123", "NewPass123");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}
