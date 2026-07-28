package com.aurora.info_hub.controller;


import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {


    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }



    
    @GetMapping
    public List<User> getAllUsers(){

        return userService.getAllUsers();
    }



    
    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id
    ){

        return userService.getUserById(id);
    }



    
    @PostMapping
    public User addUser(
            @RequestBody User user
    ){

        return userService.createUser(user);
    }



    



    
    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable Long id
    ){

        userService.deleteUser(id);
    }

}
