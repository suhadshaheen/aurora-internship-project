package com.aurora.info_hub.service;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    @Value("${app.frontend-url}")
    private String frontendUrl;
    public void sendResetPasswordEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request - Info Hub");
        message.setText("Click the link below to reset your password:\n\n" + resetLink
                + "\n\nThis link will expire in 15 minutes.\nIf you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}
