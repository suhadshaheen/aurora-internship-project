package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.category.CategoryRequest;
import com.aurora.info_hub.dto.category.CategoryResponse;
import com.aurora.info_hub.exception.ConflictException;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.security.CorsConfig;
import com.aurora.info_hub.security.JwtAuthenticationFilter;
import com.aurora.info_hub.security.SecurityConfig;
import com.aurora.info_hub.service.CategoryService;
import com.aurora.info_hub.service.CustomUserDetailsService;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(controllers = CategoryController.class )
@Import({SecurityConfig.class, CorsConfig.class})
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

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

    private CategoryResponse sampleCategoryResponse() {
        return CategoryResponse.builder()
                .id(1L)
                .catName("Networking")
                .dateCreated(LocalDateTime.now())
                .build();
    }


    @Test
    @DisplayName("test valid get all categories when anonymous")
    void getAllCategoriesWhenAnonymous() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(List.of(sampleCategoryResponse()));

        mockMvc.perform(get("/categories")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1))).andExpect(jsonPath("$[0].catName").value("Networking"));
    }

    @Test
    @DisplayName("test valid get all categories when none exist")
    void getAllCategoriesWhenNoneExist() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(List.of());

        mockMvc.perform(get("/categories")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("test valid get category by id when found")
    void getCategoryByIdWhenFound() throws Exception {
        when(categoryService.getCategoryById(1L)).thenReturn(sampleCategoryResponse());

        mockMvc.perform(get("/categories/1")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("test invalid get category by id when not found")
    void getCategoryByIdWhenNotFound() throws Exception {
        when(categoryService.getCategoryById(99L))
                .thenThrow(new NotFoundException("Category Not Found"));

        mockMvc.perform(get("/categories/99")).andExpect(status().isNotFound());
    }


    @Test
    @DisplayName("test invalid create category when not authenticated")
    void createCategoryWhenNotAuthenticated() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setCatName("DevOps");

        mockMvc.perform(post("/categories").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request))).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test invalid create category when authenticated but not admin")
    void createCategoryWhenNotAdmin() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setCatName("DevOps");

        mockMvc.perform(post("/categories").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request)).with(user("suhad_sh").roles("EMPLOYEE"))).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("test valid create category when admin")
    void createCategoryWhenAdmin() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setCatName("DevOps");

        when(categoryService.createCategory(any(CategoryRequest.class))).thenReturn(sampleCategoryResponse());

        mockMvc.perform(post("/categories").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request)).with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$.catName").value("Networking"));
    }

    @Test
    @DisplayName("test invalid create category when name already exists")
    void createCategoryWhenNameAlreadyExists() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setCatName("Networking");

        when(categoryService.createCategory(any(CategoryRequest.class)))
                .thenThrow(new ConflictException("Category already exists"));

        mockMvc.perform(post("/categories").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request)).with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isConflict());
    }

    @Test
    @DisplayName("test invalid create category when catName is blank")
    void createCategoryWhenCatNameIsBlank() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setCatName("");

        mockMvc.perform(post("/categories").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request)).with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("test invalid delete category when not authenticated")
    void deleteCategoryWhenNotAuthenticated() throws Exception {
        mockMvc.perform(delete("/categories/1")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("test invalid delete category when authenticated but not admin")
    void deleteCategoryWhenNotAdmin() throws Exception {
        mockMvc.perform(delete("/categories/1").with(user("suhad_sh").roles("EMPLOYEE"))).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("test valid delete category when admin")
    void deleteCategoryWhenAdmin() throws Exception {
        mockMvc.perform(delete("/categories/1").with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isOk());
    }

    @Test
    @DisplayName("test invalid delete category when it has linked sections")
    void deleteCategoryWhenLinkedSectionsExist() throws Exception {
        org.mockito.Mockito.doThrow(new ConflictException("Cannot delete category: it still has sections linked to it")).when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/categories/1").with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isConflict());
    }

    @Test
    @DisplayName("test invalid delete category when not found")
    void deleteCategoryWhenNotFound() throws Exception {
        org.mockito.Mockito.doThrow(new NotFoundException("Category Not Found")).when(categoryService).deleteCategory(99L);

        mockMvc.perform(delete("/categories/99").with(user("suhad_sh").roles("ADMIN"))).andExpect(status().isNotFound());
    }
}