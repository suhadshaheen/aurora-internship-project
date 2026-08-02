package com.aurora.info_hub.service;

import com.aurora.info_hub.FileStorageService;
import com.aurora.info_hub.dto.section.*;
import com.aurora.info_hub.entity.*;
import com.aurora.info_hub.repository.CategoryRepository;
import com.aurora.info_hub.repository.SectionDocsRepository;
import com.aurora.info_hub.repository.SectionImageRepository;
import com.aurora.info_hub.repository.SectionRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SectionService {

    private final CategoryRepository categoryRepository;

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
    public SectionService(CategoryRepository categoryRepository, SectionDocsRepository sectionDocsRepository, SectionImageRepository sectionImageRepository, FileStorageService fileStorageService, SectionRepository sectionRepositry) {
        this.categoryRepository = categoryRepository;
        this.sectionDocsRepository = sectionDocsRepository;
        this.sectionImageRepository = sectionImageRepository;
        this.fileStorageService = fileStorageService;
        this.sectionRepository = sectionRepositry;
    }

    public List<SectionResponse> getAllSections() {

        return sectionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public SectionResponse getSectionById(Long id) {
        return toResponse(getSectionEntity(id));
    }

    @Transactional
    public SectionResponse createSection(String title, String content, Long categoryId, List<MultipartFile> images, List<MultipartFile> documents) {
        if (title == null || title.isBlank()) {
            throw new RuntimeException("Title is required");
        }
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Content is required");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category Not Found!"));


        Section section = Section.builder()
                .title(title)
                .content(content)
                .category(category)
                .createdBy(user)
                .visibility(true)
                .build();

        Section savedSection = sectionRepository.save(section);

        if (images != null) {
            for (MultipartFile image : images) {
                String type = image.getContentType();

                if (!List.of("image/jpeg", "image/png", "image/webp").contains(type)) {

                    throw new RuntimeException("Only JPEG, PNG and WEBP images are allowed");
                }
                String url = fileStorageService.storeFile(image);
                SectionImage sectionImage = SectionImage.builder().imageUrl(url).section(savedSection).build();

                sectionImageRepository.save(sectionImage);


                savedSection.getImages().add(sectionImage);
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
                SectionDocs sectionDoc = SectionDocs.builder().fileName(document.getOriginalFilename()).fileUrl(url).section(savedSection).build();

                sectionDocsRepository.save(sectionDoc);

                savedSection.getSectionDocs().add(sectionDoc);
            }
        }


        return toResponse(sectionRepository.findById(savedSection.getId()).orElseThrow(() -> new RuntimeException("Section Not Found")));
    }

    @Transactional
    public SectionResponse updateSection(Long id, SectionRequest  request){

        Section existingSection = getSectionEntity(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category Not Found!"));

        existingSection.setTitle(request.getTitle());
        existingSection.setContent(request.getContent());
        existingSection.setVisibility(request.getVisibility());
        existingSection.setCategory(category);


        return toResponse(sectionRepository.save(existingSection));
    }
    public void  deleteSection(Long id){

        sectionRepository.deleteById(id);
    }
    @Transactional
    public Section patchSection(Long id, Section section){

        Section existingSection = getSectionEntity(id);

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

    private SectionResponse toResponse(Section section) {

        return SectionResponse.builder()
                .id(section.getId())
                .title(section.getTitle())
                .content(section.getContent())
                .visibility(section.getVisibility())
                .createdAt(section.getCreatedAt())

                .category(toSectionCategoryResponse(section.getCategory()))
                .createdBy(toSectionUserResponse(section.getCreatedBy()))

                .images(
                        section.getImages() == null
                                ? List.of()
                                : section.getImages()
                                .stream()
                                .map(this::toImageResponse)
                                .toList()
                )

                .documents(
                        section.getSectionDocs() == null
                                ? List.of()
                                : section.getSectionDocs()
                                .stream()
                                .map(this::toDocumentResponse)
                                .toList()
                )

                .build();
    }

    private SectionUserResponse toSectionUserResponse(User createdBy) {
        if(createdBy == null){
            return null;
        }
        return SectionUserResponse.builder().id(createdBy.getId()).userHandle(createdBy.getUserHandle()).role(createdBy.getRole()).build();
    }

    private SectionCategoryResponse toSectionCategoryResponse(Category category) {
        if(category == null){
            return null;
        }
        return SectionCategoryResponse.builder().id(category.getId()).catName(category.getCatName()).build();
    }


    private SectionImageResponse toImageResponse(SectionImage image) {

        if (image == null) {
            return null;
        }

        return SectionImageResponse.builder().id(image.getId()).imageUrl(image.getImageUrl()).build();
    }
    private SectionDocResponse toDocumentResponse(SectionDocs document) {

        if (document == null) {
            return null;
        }

        return SectionDocResponse.builder().id(document.getId()).fileName(document.getFileName()).fileUrl(document.getFileUrl()).build();
    }
    private Section getSectionEntity(Long id) {

        return sectionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Section Not Found"));
    }

    public List<SectionResponse> getSectionsByCategory(Long categoryId) {
        return sectionRepository.findByCategoryId(categoryId)
                .stream().map(this::toResponse).toList();
    }
}
