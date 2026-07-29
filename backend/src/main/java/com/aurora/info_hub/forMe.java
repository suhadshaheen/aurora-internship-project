package com.aurora.info_hub;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class forMe {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println(
                encoder.encode("123456")
        );
    }
}
