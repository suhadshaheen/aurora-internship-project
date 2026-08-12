package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.comment.CommentRequest;
import com.aurora.info_hub.dto.comment.CommentResponse;
import com.aurora.info_hub.dto.comment.CommentUpdateRequest;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.service.CommentService;
import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CommentService commentService;

    // JwtAuthenticationFilter (loaded automatically by @WebMvcTest as part of
    // the security filter chain) depends on JwtService and
    // CustomUserDetailsService, which are @Service beans not loaded by the
    // @WebMvcTest slice. We mock both here just to satisfy the filter's
    // constructor so the context can load.
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private CommentResponse sampleResponse() {
        return CommentResponse.builder()
                .id(1L)
                .content("Some content")
                .createdById(1L)
                .createdByName("john")
                .sectionId(100L)
                .parentCommentId(null)
                .dateCreated(LocalDateTime.now())
                .children(List.of())
                .build();
    }

    // ---------- GET /comments ----------

    @Test
    @WithMockUser
    void getAllComments_shouldReturn200AndList_whenNoSectionIdGiven() throws Exception {
        when(commentService.getAllComments()).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content").value("Some content"));

        verify(commentService).getAllComments();
        verify(commentService, never()).getCommentsBySection(any());
    }

    @Test
    @WithMockUser
    void getAllComments_shouldCallGetCommentsBySection_whenSectionIdGiven() throws Exception {
        when(commentService.getCommentsBySection(100L)).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/comments").param("sectionId", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(commentService).getCommentsBySection(100L);
        verify(commentService, never()).getAllComments();
    }

    // ---------- GET /comments/{id} ----------

    @Test
    @WithMockUser
    void getCommentById_shouldReturn200_whenCommentExists() throws Exception {
        when(commentService.getCommentById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/comments/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void getCommentById_shouldReturn404_whenCommentNotFound() throws Exception {
        when(commentService.getCommentById(99L)).thenThrow(new NotFoundException("Comment not found"));

        mockMvc.perform(get("/comments/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Comment not found"));
    }

    // ---------- POST /comments ----------

    @Test
    @WithMockUser
    void addComment_shouldReturn200_whenRequestValid() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(100L);

        when(commentService.createComment(any(CommentRequest.class))).thenReturn(sampleResponse());

        mockMvc.perform(post("/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Some content"));
    }

    @Test
    @WithMockUser
    void addComment_shouldReturn400_whenContentIsBlank() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setContent("");
        request.setSectionId(100L);

        mockMvc.perform(post("/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.content").exists());

        verifyNoInteractions(commentService);
    }

    @Test
    @WithMockUser
    void addComment_shouldReturn400_whenSectionIdIsMissing() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(null);

        mockMvc.perform(post("/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sectionId").exists());
    }

    @Test
    @WithMockUser
    void addComment_shouldReturn404_whenSectionNotFound() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(999L);

        when(commentService.createComment(any(CommentRequest.class)))
                .thenThrow(new NotFoundException("Section not found"));

        mockMvc.perform(post("/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Section not found"));
    }

    @Test
    @WithMockUser
    void addComment_shouldReturn400_whenBodyIsMalformedJson() throws Exception {
        mockMvc.perform(post("/comments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-valid-json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(commentService);
    }

    // ---------- PATCH /comments/{id} ----------

    @Test
    @WithMockUser
    void updateComment_shouldReturn200_whenRequestValid() throws Exception {
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Updated content");

        when(commentService.updateComment(eq(1L), any(CommentUpdateRequest.class)))
                .thenReturn(sampleResponse());

        mockMvc.perform(patch("/comments/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void updateComment_shouldReturn400_whenContentIsBlank() throws Exception {
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("");

        mockMvc.perform(patch("/comments/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.content").exists());

        verifyNoInteractions(commentService);
    }

    @Test
    @WithMockUser
    void updateComment_shouldReturn403_whenNotOwnerOrAdmin() throws Exception {
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Trying to edit");

        when(commentService.updateComment(eq(1L), any(CommentUpdateRequest.class)))
                .thenThrow(new AccessDeniedException("You can only edit your own comments"));

        mockMvc.perform(patch("/comments/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void updateComment_shouldReturn404_whenCommentNotFound() throws Exception {
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Updated content");

        when(commentService.updateComment(eq(99L), any(CommentUpdateRequest.class)))
                .thenThrow(new NotFoundException("Comment not found"));

        mockMvc.perform(patch("/comments/{id}", 99L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void updateComment_shouldReturn400_whenBodyIsMalformedJson() throws Exception {
        mockMvc.perform(patch("/comments/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-valid-json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(commentService);
    }

    // ---------- DELETE /comments/{id} ----------

    @Test
    @WithMockUser
    void deleteComment_shouldReturn200_onSuccess() throws Exception {
        doNothing().when(commentService).deleteComment(1L);

        mockMvc.perform(delete("/comments/{id}", 1L).with(csrf()))
                .andExpect(status().isOk());

        verify(commentService).deleteComment(1L);
    }

    @Test
    @WithMockUser
    void deleteComment_shouldReturn403_whenNotOwnerOrAdmin() throws Exception {
        doThrow(new AccessDeniedException("You can only delete your own comments"))
                .when(commentService).deleteComment(1L);

        mockMvc.perform(delete("/comments/{id}", 1L).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void deleteComment_shouldReturn404_whenCommentNotFound() throws Exception {
        doThrow(new NotFoundException("Comment not found"))
                .when(commentService).deleteComment(99L);

        mockMvc.perform(delete("/comments/{id}", 99L).with(csrf()))
                .andExpect(status().isNotFound());
    }
}