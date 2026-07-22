package com.aurora.info_hub.controller;

import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.service.SectionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sections")
public class SectionController {
    private final SectionService sectionService;
    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }
    @GetMapping
    public List<Section> getSections() {
        return sectionService.getAllSections();
    }
    @GetMapping("/{id}")
    public Section getCategoryById(@PathVariable Long id) {
        return sectionService.getSectionById(id);
    }
@PostMapping
public Section addSection(@RequestBody Section section) {
        return sectionService.createSection(section);
}

}
