package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.category.CategoryRequest;
import com.aurora.info_hub.dto.category.CategoryResponse;
import com.aurora.info_hub.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @GetMapping
    public List<CategoryResponse> getAllCategories(){
        return categoryService.getAllCategories();
    }
    @GetMapping("/{id}")
    public CategoryResponse  getCategoryById(@PathVariable Long id){
        return categoryService.getCategoryById(id);

    }
    @PostMapping
    public CategoryResponse createCategory(@RequestBody CategoryRequest request){
        return categoryService.createCategory(request);
    }

@DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id){
        categoryService.deleteCategory(id);
}


}
