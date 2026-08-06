package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.category.CategoryRequest;
import com.aurora.info_hub.dto.category.CategoryResponse;
import com.aurora.info_hub.entity.Category;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.repository.CategoryRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public CategoryResponse getCategoryById(Long id) {
        return toResponse(getCategoryEntity(id));
    }


    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (request.getCatName() == null || request.getCatName().isBlank()) {
            throw new RuntimeException("Category name is required");
        }
        if (categoryRepository.existsByCatName(request.getCatName())) {
            throw new RuntimeException("Category already exists");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Category category = Category.builder()
                .catName(request.getCatName())
                .createdBy(user)
                .build();

        categoryRepository.save(category);
        return toResponse(category);

    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryEntity(id);
        if (category.getSections() != null && !category.getSections().isEmpty()) {
            throw new RuntimeException("Cannot delete category: it still has sections linked to it");
        }
        categoryRepository.deleteById(id);
    }
    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .catName(category.getCatName())
                .dateCreated(category.getDateCreated())
                .build();
    }



    private Category getCategoryEntity(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category Not Found"));    }
}
