package com.aurora.info_hub.service;

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


    
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


   
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }


    
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }




    
    public void deleteUser(Long id) {

        User user = getUserById(id);

        userRepository.delete(user);
    }


}
