package com.aurora.info_hub.service;


import com.aurora.info_hub.entity.PasswordResetToken;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.exception.ConflictException;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.PasswordResetTokenRepository;
import com.aurora.info_hub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@auroratech.ps")
                .password("oldEncodedPassword")
                .build();
    }

    private PasswordResetToken buildToken(String token, User user, boolean used, LocalDateTime expiryDate) {
        return PasswordResetToken.builder().id(1L).token(token).user(user).used(used).expiryDate(expiryDate).build();
    }

    @Test
    @DisplayName("test valid request password reset when email exists")
    void requestPasswordResetWhenEmailExists() {
        when(userRepository.findByEmailAndDeletedFalse("test@auroratech.ps"))
                .thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        String result = passwordResetService.requestPasswordReset("test@auroratech.ps");

        assertThat(result).isEqualTo("Password reset link has been sent to your email.");
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("test valid request password reset should send email with generated token")
    void requestPasswordResetShouldSendEmailWithToken() {
        when(userRepository.findByEmailAndDeletedFalse("test@auroratech.ps"))
                .thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        passwordResetService.requestPasswordReset("test@auroratech.ps");

        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendResetPasswordEmail(eq("test@auroratech.ps"), tokenCaptor.capture());
        assertThat(tokenCaptor.getValue()).isNotBlank();
    }

    @Test
    @DisplayName("test invalid request password reset when email does not exist")
    void requestPasswordResetWhenEmailDoesNotExist() {
        when(userRepository.findByEmailAndDeletedFalse("unknown@auroratech.ps"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                passwordResetService.requestPasswordReset("unknown@auroratech.ps")).isInstanceOf(NotFoundException.class).hasMessage("No account is registered with this email address.");

        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("test valid request password reset should delete old token when one exists")
    void requestPasswordResetShouldDeleteOldToken() {
        PasswordResetToken oldToken = buildToken("old-token", testUser, false, LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByEmailAndDeletedFalse("test@auroratech.ps")).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(oldToken));

        passwordResetService.requestPasswordReset("test@auroratech.ps");

        verify(tokenRepository).delete(oldToken);
    }

    @Test
    @DisplayName("test valid request password reset should not call delete when no old token exists")
    void requestPasswordResetShouldNotDeleteWhenNoOldToken() {
        when(userRepository.findByEmailAndDeletedFalse("test@auroratech.ps")).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        passwordResetService.requestPasswordReset("test@auroratech.ps");

        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("test valid reset password when token is valid")
    void resetPasswordWhenTokenIsValid() {
        PasswordResetToken validToken = buildToken("valid-token", testUser, false, LocalDateTime.now().plusMinutes(10));

        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode("NewPass123")).thenReturn("encodedNewPass");

        passwordResetService.resetPassword("valid-token", "NewPass123", "NewPass123");

        assertThat(testUser.getPassword()).isEqualTo("encodedNewPass");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("test valid reset password should mark token as used")
    void resetPasswordShouldMarkTokenAsUsed() {
        PasswordResetToken validToken = buildToken("valid-token", testUser, false, LocalDateTime.now().plusMinutes(10));

        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedNewPass");

        passwordResetService.resetPassword("valid-token", "NewPass123", "NewPass123");

        assertThat(validToken.isUsed()).isTrue();
        verify(tokenRepository).save(validToken);
    }

    @Test
    @DisplayName("test invalid reset password when passwords do not match")
    void resetPasswordWhenPasswordsDoNotMatch() {
        assertThatThrownBy(() ->
                passwordResetService.resetPassword("any-token", "Pass1", "Pass2")).isInstanceOf(IllegalArgumentException.class).hasMessage("Passwords do not match");

        verify(tokenRepository, never()).findByToken(anyString());
    }

    @Test
    @DisplayName("test invalid reset password when token does not exist")
    void resetPasswordWhenTokenDoesNotExist() {
        when(tokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                passwordResetService.resetPassword("invalid-token", "NewPass123", "NewPass123")).isInstanceOf(NotFoundException.class).hasMessage("Invalid reset token");
    }

    @Test
    @DisplayName("test invalid reset password when token already used")
    void resetPasswordWhenTokenAlreadyUsed() {
        PasswordResetToken usedToken = buildToken("used-token", testUser, true, LocalDateTime.now().plusMinutes(10));

        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(usedToken));

        assertThatThrownBy(() ->
                passwordResetService.resetPassword("used-token", "NewPass123", "NewPass123")).isInstanceOf(ConflictException.class).hasMessage("This reset link has already been used");
    }

    @Test
    @DisplayName("test invalid reset password when token expired")
    void resetPasswordWhenTokenExpired() {
        PasswordResetToken expiredToken = buildToken("expired-token", testUser, false, LocalDateTime.now().minusMinutes(5));

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() ->
                passwordResetService.resetPassword("expired-token", "NewPass123", "NewPass123")).isInstanceOf(IllegalArgumentException.class).hasMessage("This reset link has expired");
    }
}