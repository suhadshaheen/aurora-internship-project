package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.section.*;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.security.CorsConfig;
import com.aurora.info_hub.security.JwtAuthenticationFilter;
import com.aurora.info_hub.service.CustomUserDetailsService;
import com.aurora.info_hub.service.SectionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.aurora.info_hub.security.SecurityConfig;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = SectionController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class SectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();
    @MockitoBean
    private SectionService sectionService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private SectionResponse sampleSectionResponse() {
        SectionCategoryResponse category = SectionCategoryResponse.builder()
                .id(10L).catName("Networking").build();

        SectionUserResponse createdBy = SectionUserResponse.builder()
                .id(1L).userHandle("suhad_sh").role("EMPLOYEE").build();

        return SectionResponse.builder()
                .id(1L)
                .title("Test Section")
                .content("Test content")
                .visibility(true)
                .important(false)
                .createdAt(LocalDateTime.now())
                .category(category)
                .createdBy(createdBy)
                .images(List.of())
                .documents(List.of())
                .build();
    }
    @BeforeEach
    void setUpFilter() throws Exception {
        doAnswer(invocation -> {
            ServletRequest request = invocation.getArgument(0);
            ServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }
    @Test
    @DisplayName("test valid get sections when anonymous")
    void getSectionsWhenAnonymous() throws Exception {
        when(sectionService.getAllSections()).thenReturn(List.of(sampleSectionResponse()));

        mockMvc.perform(get("/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Section"));
    }

    @Test
    @DisplayName("test valid get sections when no sections exist")
    void getSectionsWhenNoSectionsExist() throws Exception {
        when(sectionService.getAllSections()).thenReturn(List.of());

        mockMvc.perform(get("/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("test valid get section by id when found")
    void getSectionByIdWhenFound() throws Exception {
        when(sectionService.getSectionById(1L)).thenReturn(sampleSectionResponse());

        mockMvc.perform(get("/sections/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("test invalid get section by id when not found")
    void getSectionByIdWhenNotFound() throws Exception {
        when(sectionService.getSectionById(99L))
                .thenThrow(new NotFoundException("Section Not Found"));

        mockMvc.perform(get("/sections/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("test invalid add section when not authenticated")
    void addSectionWhenNotAuthenticated() throws Exception {
        mockMvc.perform(multipart("/sections")
                        .param("title", "Title")
                        .param("content", "Content")
                        .param("categoryId", "10"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test valid add section when authenticated")
    void addSectionWhenAuthenticated() throws Exception {
        when(sectionService.createSection(
                eq("Title"), eq("Content"), eq(10L), eq(true), any(), any()))
                .thenReturn(sampleSectionResponse());

        mockMvc.perform(multipart("/sections")
                        .param("title", "Title")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .param("visibility", "true")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Section"));
    }

    @Test
    @DisplayName("test invalid add section when title missing")
    void addSectionWhenTitleMissing() throws Exception {
        when(sectionService.createSection(any(), any(), any(), any(), any(), any()))
                .thenThrow(new IllegalArgumentException("Title is required"));

        mockMvc.perform(multipart("/sections")
                        .param("title", "")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("test valid add section with image and document files")
    void addSectionWithFiles() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "images", "photo.jpg", "image/jpeg", "data".getBytes());
        MockMultipartFile document = new MockMultipartFile(
                "documents", "report.pdf", "application/pdf", "data".getBytes());

        when(sectionService.createSection(
                eq("Title"), eq("Content"), eq(10L), eq(true), any(), any()))
                .thenReturn(sampleSectionResponse());

        mockMvc.perform(multipart("/sections")
                        .file(image)
                        .file(document)
                        .param("title", "Title")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .param("visibility", "true")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("test invalid update section when not authenticated")
    void updateSectionWhenNotAuthenticated() throws Exception {
        mockMvc.perform(multipart("/sections/1")
                        .param("title", "Title")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test valid update section when owner")
    void updateSectionWhenOwner() throws Exception {
        when(sectionService.updateSection(
                eq(1L), eq("Updated"), eq("Content"), eq(10L), eq(true), any()))
                .thenReturn(sampleSectionResponse());

        mockMvc.perform(multipart("/sections/1")
                        .param("title", "Updated")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .param("visibility", "true")
                        .with(user("suhad_sh").roles("EMPLOYEE"))
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("test invalid update section when access denied")
    void updateSectionWhenAccessDenied() throws Exception {
        when(sectionService.updateSection(any(), any(), any(), any(), any(), any()))
                .thenThrow(new AccessDeniedException("You can only edit your own sections"));

        mockMvc.perform(multipart("/sections/1")
                        .param("title", "Title")
                        .param("content", "Content")
                        .param("categoryId", "10")
                        .with(user("other_user").roles("EMPLOYEE"))
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("test invalid delete section when not authenticated")
    void deleteSectionWhenNotAuthenticated() throws Exception {
        mockMvc.perform(delete("/sections/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test valid delete section when authenticated")
    void deleteSectionWhenAuthenticated() throws Exception {
        mockMvc.perform(delete("/sections/1")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("test invalid delete section when access denied")
    void deleteSectionWhenAccessDenied() throws Exception {
        doThrow(new AccessDeniedException("denied"))
                .when(sectionService).deleteSection(1L);

        mockMvc.perform(delete("/sections/1")
                        .with(user("other_user").roles("EMPLOYEE")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("test valid delete section document when authenticated")
    void deleteSectionDocumentWhenAuthenticated() throws Exception {
        when(sectionService.deleteSectionDocument(1L, 5L)).thenReturn(sampleSectionResponse());

        mockMvc.perform(delete("/sections/1/documents/5")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("test invalid delete section document when document not found")
    void deleteSectionDocumentWhenNotFound() throws Exception {
        when(sectionService.deleteSectionDocument(1L, 999L))
                .thenThrow(new NotFoundException("Document not found"));

        mockMvc.perform(delete("/sections/1/documents/999")
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("test invalid patch section when not authenticated")
    void patchSectionWhenNotAuthenticated() throws Exception {
        SectionPatchRequest request = new SectionPatchRequest();
        request.setTitle("New Title");

        mockMvc.perform(patch("/sections/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test valid patch section when authenticated")
    void patchSectionWhenAuthenticated() throws Exception {
        SectionPatchRequest request = new SectionPatchRequest();
        request.setTitle("New Title");

        when(sectionService.patchSection(eq(1L), any(SectionPatchRequest.class)))
                .thenReturn(sampleSectionResponse());

        mockMvc.perform(patch("/sections/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(user("suhad_sh").roles("EMPLOYEE")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("test valid get sections by category")
    void getSectionsByCategory() throws Exception {
        when(sectionService.getSectionsByCategory(10L)).thenReturn(List.of(sampleSectionResponse()));

        mockMvc.perform(get("/sections/by-category/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("test invalid get sections by category when no matches")
    void getSectionsByCategoryWhenNoMatches() throws Exception {
        when(sectionService.getSectionsByCategory(999L)).thenReturn(List.of());

        mockMvc.perform(get("/sections/by-category/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}