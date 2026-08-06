package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.auth.LoginRequest;
import com.aurora.info_hub.dto.auth.LoginResponse;
import com.aurora.info_hub.service.JwtService;
import com.aurora.info_hub.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import com.aurora.info_hub.entity.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private  final JwtService jwtService;
    private final PasswordResetService passwordResetService;
    

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, PasswordResetService passwordResetService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;

        this.passwordResetService = passwordResetService;
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(new LoginResponse(token, user.getUserHandle(), user.getEmail(), user.getRole()));    }



}
