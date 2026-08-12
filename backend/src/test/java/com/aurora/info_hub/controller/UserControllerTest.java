package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.user.UserRequest;
import com.aurora.info_hub.dto.user.UserResponse;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.JwtService;
import com.aurora.info_hub.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    // JwtAuthenticationFilter (loaded automatically by @WebMvcTest as part of
    // the security filter chain) depends on JwtService and
    // CustomUserDetailsService, neither of which is loaded by the
    // @WebMvcTest slice (they're @Service beans, not web-layer beans). We
    // mock both here just to satisfy the filter's constructor so the
    // context can load.
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private UserResponse sampleResponse() {
        return UserResponse.builder()
                .id(1L)
                .userHandle("john")
                .email("john@example.com")
                .role("EMPLOYEE")
                .deleted(false)
                .build();
    }

    // ---------- GET /users ----------

    @Test
    @WithMockUser
    void getAllUsers_shouldReturn200AndList() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("john@example.com"));
    }

    @Test
    @WithMockUser
    void getAllUsers_shouldReturn200AndEmptyList_whenNoUsers() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ---------- GET /users/{id} ----------

    @Test
    @WithMockUser
    void getUserById_shouldReturn200_whenUserExists() throws Exception {
        when(userService.getUserById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/users/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userHandle").value("john"));
    }

    @Test
    @WithMockUser
    void getUserById_shouldReturn404_whenUserNotFound() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new NotFoundException("User not found"));

        mockMvc.perform(get("/users/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    // ---------- POST /users ----------

    @Test
    @WithMockUser
    void addUser_shouldReturn200_whenRequestValid() throws Exception {
        UserRequest request = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("plainPass")
                .role("ADMIN")
                .build();

        when(userService.createUser(any(UserRequest.class))).thenReturn(sampleResponse());

        mockMvc.perform(post("/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @WithMockUser
    void addUser_shouldReturn400_whenEmailIsMissing() throws Exception {
        UserRequest invalidRequest = UserRequest.builder()
                .userHandle("newuser")
                .email("")
                .password("plainPass")
                .build();

        mockMvc.perform(post("/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());

        verifyNoInteractions(userService);
    }

    @Test
    @WithMockUser
    void addUser_shouldReturn400_whenEmailFormatIsInvalid() throws Exception {
        UserRequest invalidRequest = UserRequest.builder()
                .userHandle("newuser")
                .email("not-an-email")
                .password("plainPass")
                .build();

        mockMvc.perform(post("/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @WithMockUser
    void addUser_shouldReturn400_whenPasswordIsMissing() throws Exception {
        UserRequest invalidRequest = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("")
                .build();

        mockMvc.perform(post("/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @WithMockUser
    void addUser_shouldReturn400_whenBodyIsMalformedJson() throws Exception {
        mockMvc.perform(post("/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-valid-json"))
                .andExpect(status().isBadRequest());
    }

    // ---------- DELETE /users/{id} ----------

    @Test
    @WithMockUser
    void deleteUser_shouldReturn200_onSuccess() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/users/{id}", 1L).with(csrf()))
                .andExpect(status().isOk());

        verify(userService).deleteUser(1L);
    }

    @Test
    @WithMockUser
    void deleteUser_shouldReturn400_whenDeletingSelf() throws Exception {
        doThrow(new IllegalArgumentException("You cannot delete your own account."))
                .when(userService).deleteUser(1L);

        mockMvc.perform(delete("/users/{id}", 1L).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("You cannot delete your own account."));
    }

    @Test
    @WithMockUser
    void deleteUser_shouldReturn404_whenUserNotFound() throws Exception {
        doThrow(new NotFoundException("User not found"))
                .when(userService).deleteUser(99L);

        mockMvc.perform(delete("/users/{id}", 99L).with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found"));
    }
}