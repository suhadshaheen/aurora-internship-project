package com.aurora.info_hub.controller;

import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.service.SectionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public Section getSectionById(@PathVariable Long id)  {
        return sectionService.getSectionById(id);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Section addSection(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents
    ) {
        return sectionService.createSection(title, content,categoryId, images, documents);
    }
@PutMapping("/{id}")
    public Section updateSection(
            @PathVariable Long id,
            @RequestBody Section section

    ){
        return sectionService.updateSection(id, section);
    }
    @DeleteMapping("/{id}")
    public void deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);

    }
    @PatchMapping("/{id}")
    public Section patchSection(
            @PathVariable Long id,
            @RequestBody Section section
    ){
        return sectionService.patchSection(id, section);
    }
}
