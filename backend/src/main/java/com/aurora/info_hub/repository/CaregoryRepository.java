package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CaregoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor {
boolean existsByName(String catName);
}
