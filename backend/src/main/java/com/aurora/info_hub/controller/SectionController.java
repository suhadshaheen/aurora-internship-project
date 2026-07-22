package com.aurora.info_hub.controller;

import com.aurora.info_hub.service.SectionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sections")
public class SectionController {
    private final SectionService sectionService;
    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }
}
