package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.category.CategoryRequest;
import com.aurora.info_hub.dto.category.CategoryResponse;
import com.aurora.info_hub.entity.Category;
import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.exception.ConflictException;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.CategoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .userHandle("suhad_sh")
                .role("ADMIN")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Category buildCategory(Long id, String name, User createdBy) {
        return Category.builder()
                .id(id)
                .catName(name)
                .createdBy(createdBy)
                .build();
    }

    @Test
    @DisplayName("test valid get all categories")
    void getAllCategories() {
        Category category = buildCategory(1L, "Networking", adminUser);
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCatName()).isEqualTo("Networking");
    }

    @Test
    @DisplayName("test invalid get all categories when none exist")
    void getAllCategoriesWhenNoneExist() {
        when(categoryRepository.findAll()).thenReturn(List.of());

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("test valid get category by id when found")
    void getCategoryByIdWhenFound() {
        Category category = buildCategory(1L, "Networking", adminUser);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        CategoryResponse response = categoryService.getCategoryById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getCatName()).isEqualTo("Networking");
    }

    @Test
    @DisplayName("test invalid get category by id when not found")
    void getCategoryByIdWhenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getCategoryById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Category Not Found");
    }

    @Test
    @DisplayName("test valid create category")
    void createCategory() {
        authenticateAs(adminUser);
        CategoryRequest request = new CategoryRequest();
        request.setCatName("DevOps");

        when(categoryRepository.existsByCatName("DevOps")).thenReturn(false);

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response.getCatName()).isEqualTo("DevOps");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("test invalid create category when name already exists")
    void createCategoryWhenNameAlreadyExists() {
        authenticateAs(adminUser);
        CategoryRequest request = new CategoryRequest();
        request.setCatName("Networking");

        when(categoryRepository.existsByCatName("Networking")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Category already exists");

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("test valid delete category when no sections linked")
    void deleteCategoryWhenNoSectionsLinked() {
        Category category = buildCategory(1L, "Networking", adminUser);
        category.setSections(List.of());
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    @DisplayName("test valid delete category when sections list is null")
    void deleteCategoryWhenSectionsListIsNull() {
        Category category = buildCategory(1L, "Networking", adminUser);
        category.setSections(null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    @DisplayName("test invalid delete category when sections are linked")
    void deleteCategoryWhenSectionsAreLinked() {
        Category category = buildCategory(1L, "Networking", adminUser);
        Section section = Section.builder().id(1L).title("Some Section").build();
        category.setSections(List.of(section));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("still has sections linked");

        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("test invalid delete category when not found")
    void deleteCategoryWhenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.deleteCategory(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Category Not Found");

        verify(categoryRepository, never()).deleteById(any());
    }
}