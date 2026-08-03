package com.aurora.info_hub.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long id;
    private String userHandle;
    private String email;
    private String role;
}
