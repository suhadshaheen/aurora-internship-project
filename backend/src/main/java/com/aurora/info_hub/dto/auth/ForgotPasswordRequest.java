package com.aurora.info_hub.dto.auth;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}