package com.aurora.info_hub.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
