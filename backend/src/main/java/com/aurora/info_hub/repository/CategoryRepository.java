package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor {
boolean existsByCatName(String catName);
}
