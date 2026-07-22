package com.aurora.info_hub.controller;

import com.aurora.info_hub.entity.Category;
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
    public List<Category> getAllCategories(){
        return categoryService.getAllCategories();
    }
    @GetMapping("{/id}")
    public Category getCategoryById(@PathVariable Long id){
        return categoryService.getCategoryById(id);

    }
    @PostMapping
    public Category createCategory(@RequestBody Category category){
        return categoryService.createCategory(category);
    }




}
