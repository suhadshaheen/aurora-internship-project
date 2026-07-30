package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.user.UserRequest;
import com.aurora.info_hub.dto.user.UserResponse;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    public UserResponse getUserById(Long id) {

        User user = findUserEntityById(id);
        return mapToResponse(user);
    }


    public UserResponse createUser(UserRequest request) {

        User user = User.builder()
                .userHandle(request.getUserHandle())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "USER")
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }


    public UserResponse updateUser(Long id, UserRequest request) {

        User user = findUserEntityById(id);

        user.setUserHandle(request.getUserHandle());
        user.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }


    public void deleteUser(Long id) {

        User user = findUserEntityById(id);
        userRepository.delete(user);
    }


    // ----- Helpers -----

    private User findUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .userHandle(user.getUserHandle())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}