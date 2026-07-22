package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Category;
import com.aurora.info_hub.repository.CaregoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private  final CaregoryRepository caregoryRepository;
    public CategoryService(CaregoryRepository caregoryRepository) {
        this.caregoryRepository = caregoryRepository;
    }
   public List<Category> getAllCategories(){
        return caregoryRepository.findAll();
   }
   public Category getCategoryById(Long id){
        return caregoryRepository.findById(id).get();
   }
   public Category createCategory(Category category){
       return caregoryRepository.save(category);
   }

}
