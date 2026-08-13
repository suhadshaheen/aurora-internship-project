package com.aurora.info_hub.service;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender);
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:4200");
    }

    @Test
    @DisplayName("test valid send reset password email builds correct message and sends it")
    void sendResetPasswordEmail() {
        emailService.sendResetPasswordEmail("suhad@auroratech.ps", "abc123token");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertThat(sentMessage.getTo()).containsExactly("suhad@auroratech.ps");
        assertThat(sentMessage.getSubject()).isEqualTo("Password Reset Request - Info Hub");
        assertThat(sentMessage.getText()).contains("http://localhost:4200/reset-password?token=abc123token");
    }

    @Test
    @DisplayName("test valid send reset password email includes the token in the reset link")
    void sendResetPasswordEmailIncludesToken() {
        emailService.sendResetPasswordEmail("suhad@auroratech.ps", "xyz789");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        assertThat(messageCaptor.getValue().getText()).contains("token=xyz789");
    }

    @Test
    @DisplayName("test valid send reset password email sends to the correct recipient")
    void sendResetPasswordEmailSendsToCorrectRecipient() {
        emailService.sendResetPasswordEmail("different@auroratech.ps", "token1");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        assertThat(messageCaptor.getValue().getTo()).containsExactly("different@auroratech.ps");
    }

    @Test
    @DisplayName("test valid send reset password email builds link using the configured frontend url")
    void sendResetPasswordEmailUsesConfiguredFrontendUrl() {
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://infohub.auroratech.ps");

        emailService.sendResetPasswordEmail("suhad@auroratech.ps", "tok");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        assertThat(messageCaptor.getValue().getText())
                .contains("https://infohub.auroratech.ps/reset-password?token=tok");
    }

}