package com.aurora.info_hub.service;

import com.aurora.info_hub.repository.SectionRepositry;
import org.springframework.stereotype.Service;

@Service
public class SectionService {
    private final SectionRepositry sectionRepositry;
    public SectionService(SectionRepositry sectionRepositry) {
        this.sectionRepositry = sectionRepositry;
    }
}
