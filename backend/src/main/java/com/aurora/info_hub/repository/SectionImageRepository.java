package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.SectionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SectionImageRepository  extends JpaRepository<SectionImage, Long>, JpaSpecificationExecutor { 


    }