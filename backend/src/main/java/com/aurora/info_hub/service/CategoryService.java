package com.aurora.info_hub.service;

import com.aurora.info_hub.repository.CaregoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
    private  final CaregoryRepository caregoryRepository;
    public CategoryService(CaregoryRepository caregoryRepository) {
        this.caregoryRepository = caregoryRepository;
    }

}
