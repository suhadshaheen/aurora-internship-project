package com.aurora.info_hub.service;

import com.aurora.info_hub.FileStorageService;
import com.aurora.info_hub.entity.*;
import com.aurora.info_hub.repository.CaregoryRepository;
import com.aurora.info_hub.repository.SectionDocsRepository;
import com.aurora.info_hub.repository.SectionImageRepository;
import com.aurora.info_hub.repository.SectionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SectionService {

    private final CaregoryRepository categoryRepository;

    private static final List<String> ALLOWED_DOCUMENT_TYPES = List.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
);

    private  final SectionDocsRepository sectionDocsRepository;
    private final SectionImageRepository sectionImageRepository;
    private final FileStorageService fileStorageService;
    private final SectionRepository sectionRepository;
    public SectionService( CaregoryRepository categoryRepository, SectionDocsRepository sectionDocsRepository, SectionImageRepository sectionImageRepository, FileStorageService fileStorageService, SectionRepository sectionRepositry) {
        this.categoryRepository = categoryRepository;
        this.sectionDocsRepository = sectionDocsRepository;
        this.sectionImageRepository = sectionImageRepository;
        this.fileStorageService = fileStorageService;
        this.sectionRepository = sectionRepositry;
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }
public  Section getSectionById(Long id) {
    sectionRepository.findById(id).orElseThrow(()->new RuntimeException("Section Not Found!"));
        return sectionRepository.findById(id).get();
}

    public Section createSection(String title, String content, Long categoryId,
                                 List<MultipartFile> images, List<MultipartFile> documents) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category Not Found!"));


        Section section = Section.builder()
                .title(title)
                .content(content)
                .category(category)
                .createdBy(user)
                .visibility(true)
                .build();
         if (content == null || content.isBlank()) {
         throw new RuntimeException("Content is required");
}

        Section savedSection = sectionRepository.save(section);

        if (images != null) {
            for (MultipartFile image : images) {
                 String type = image.getContentType();

                 if (!List.of(
                       "image/jpeg",
                      "image/png",
                  "image/webp"
                 ).contains(type)) {

             throw new RuntimeException(
                "Only JPEG, PNG and WEBP images are allowed"
        );
    }
                String url = fileStorageService.storeFile(image);
                SectionImage sectionImage = SectionImage.builder()
                        .imageUrl(url)
                        .section(savedSection)
                        .build();
                sectionImageRepository.save(sectionImage);
            }
        }
    
        if (documents != null) {
            for (MultipartFile document : documents) {
                if (!ALLOWED_DOCUMENT_TYPES.contains(document.getContentType())) {
                   throw new RuntimeException(
                    "Unsupported document type: " + document.getContentType()
            );
        }
                String url = fileStorageService.storeFile(document);
                SectionDocs sectionDoc = SectionDocs.builder()
                        .fileName(document.getOriginalFilename())
                        .fileUrl(url)
                        .section(savedSection)
                        .build();
                sectionDocsRepository.save(sectionDoc);
            }
        }
    

        return savedSection;
    }

    public Section updateSection(Long id, Section section){

        Section existingSection = getSectionById(id);

        existingSection.setTitle(section.getTitle());
        existingSection.setContent(section.getContent());
        existingSection.setVisibility(section.getVisibility());
        existingSection.setCategory(section.getCategory());


        return sectionRepository.save(existingSection);
    }
    public void  deleteSection(Long id){

        sectionRepository.deleteById(id);
    }
    public Section patchSection(Long id, Section section){

        Section existingSection = getSectionById(id);

        if(section.getTitle() != null){
            existingSection.setTitle(section.getTitle());
        }

        if(section.getContent() != null){
            existingSection.setContent(section.getContent());
        }

        if(section.getVisibility() != null){
            existingSection.setVisibility(section.getVisibility());
        }

        if(section.getCategory() != null){
            existingSection.setCategory(section.getCategory());
        }

        return sectionRepository.save(existingSection);
    }


}
