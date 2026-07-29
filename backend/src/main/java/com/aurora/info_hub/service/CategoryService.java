package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Category;
import com.aurora.info_hub.repository.CaregoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private  final CaregoryRepository categoryRepository;
    public CategoryService(CaregoryRepository caregoryRepository) {
        this.categoryRepository = caregoryRepository;
    }
   public List<Category> getAllCategories(){
        return categoryRepository.findAll();
   }
   public Category getCategoryById(Long id){
        return categoryRepository.findById(id).get();
   }
   public Category createCategory(Category category){
    if (categoryRepository.existsByName(category.getCatName())) {
    throw new RuntimeException("Category already exists");
}
       return categoryRepository.save(category);

   }
    public Category updateCategory(Long id, Category category){

        Category existingCategory = getCategoryById(id);

        existingCategory.setCatName(category.getCatName());
        existingCategory.setCreatedBy(category.getCreatedBy());

        return categoryRepository.save(existingCategory);
    }
    public void deleteCategory(Long id){

        categoryRepository.deleteById(id);

    }

}
