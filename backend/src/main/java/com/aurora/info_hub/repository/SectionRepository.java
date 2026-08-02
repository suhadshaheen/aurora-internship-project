package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long>,
        JpaSpecificationExecutor {
    List<Section> findByCategoryId(Long categoryId);

}
