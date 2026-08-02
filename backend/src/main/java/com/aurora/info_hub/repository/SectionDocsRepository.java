package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.SectionDocs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SectionDocsRepository  extends JpaRepository<SectionDocs, Long>, JpaSpecificationExecutor { 


    }