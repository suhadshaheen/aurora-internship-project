package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.user.UserRequest;
import com.aurora.info_hub.dto.user.UserResponse;
import com.aurora.info_hub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
public class UserController {


    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }



    
      @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }


    
   @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }



    
   @PostMapping
    public UserResponse addUser(@Valid @RequestBody UserRequest request) {
        return userService.createUser(request);
    }



    
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

}
