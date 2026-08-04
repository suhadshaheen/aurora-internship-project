package com.aurora.info_hub.controller;

import com.aurora.info_hub.dto.section.SectionPatchRequest;
import com.aurora.info_hub.dto.section.SectionResponse;
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
    public List<SectionResponse> getSections() {
        return sectionService.getAllSections();
    }
    @GetMapping("/{id}")
    public SectionResponse getSectionById(@PathVariable Long id)  {
        return sectionService.getSectionById(id);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SectionResponse addSection(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "visibility", required = false, defaultValue = "true") Boolean visibility,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents
    ) {
        return sectionService.createSection(title, content, categoryId, visibility, images, documents);
    }
@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SectionResponse updateSection(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "visibility", required = false, defaultValue = "true") Boolean visibility,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents
    ){
        return sectionService.updateSection(id, title, content, categoryId, visibility, documents);
    }
    @DeleteMapping("/{id}")
    public void deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);

    }
    @PatchMapping("/{id}")
    public SectionResponse patchSection(
            @PathVariable Long id,
            @RequestBody SectionPatchRequest request
    ){
        return sectionService.patchSection(id, request);
    }
    @GetMapping("/by-category/{categoryId}")
    public List<SectionResponse> getSectionsByCategory(@PathVariable Long categoryId) {
        return sectionService.getSectionsByCategory(categoryId);
    }
}
