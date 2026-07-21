package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {


    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        return userRepository.save(user);
    }


    //PUT
    public User updateUser(Long id, User user) {


        User existingUser = getUserById(id);


        existingUser.setUserName(user.getUserName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPassword(user.getPassword());
        existingUser.setRole(user.getRole());


        return userRepository.save(existingUser);
    }



    
    public User patchUser(Long id, User user) {


        User existingUser = getUserById(id);


        if(user.getUserName() != null){
            existingUser.setUserName(user.getUserName());
        }


        if(user.getEmail() != null){
            existingUser.setEmail(user.getEmail());
        }


        if(user.getPassword() != null){
            existingUser.setPassword(user.getPassword());
        }


        if(user.getRole() != null){
            existingUser.setRole(user.getRole());
        }


        return userRepository.save(existingUser);
    }



    
    public void deleteUser(Long id) {

        User user = getUserById(id);

        userRepository.delete(user);
    }

}