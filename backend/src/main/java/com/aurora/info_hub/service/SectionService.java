package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.section.*;
import com.aurora.info_hub.entity.*;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.CategoryRepository;
import com.aurora.info_hub.repository.SectionDocsRepository;
import com.aurora.info_hub.repository.SectionImageRepository;
import com.aurora.info_hub.repository.SectionRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
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
        boolean isAnonymous = isAnonymousUser();

        return sectionRepository.findAllByOrderByImportantDescCreatedAtDesc()
                .stream()
                .filter(section -> !isAnonymous || Boolean.TRUE.equals(section.getVisibility()))
                .map(this::toResponse)
                .toList();
    }
    public SectionResponse getSectionById(Long id) {
        Section section = getSectionEntity(id);

        if (isAnonymousUser() && !Boolean.TRUE.equals(section.getVisibility())) {
            throw new RuntimeException("Section Not Found"); // نفس رسالة 404 العادية، ما منكشف وجودها
        }

        return toResponse(section);
    }

    private boolean isAnonymousUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private boolean isAdmin(User user) {
        return "ADMIN".equalsIgnoreCase(user.getRole());
    }

    private void requireOwnerOrAdmin(Section section, String action) {
        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && !section.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only " + action + " your own sections");
        }
    }

    @Transactional
    public SectionResponse createSection(String title, String content, Long categoryId, Boolean visibility, List<MultipartFile> images, List<MultipartFile> documents) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is required");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new NotFoundException("Category Not Found!"));


        Section section = Section.builder()
                .title(title)
                .content(content)
                .category(category)
                .createdBy(user)
                .visibility(visibility != null ? visibility : true)
                .build();

        Section savedSection = sectionRepository.save(section);

        if (images != null) {
            for (MultipartFile image : images) {
                String type = image.getContentType();

                if (!List.of("image/jpeg", "image/png", "image/webp").contains(type)) {

                    throw new IllegalArgumentException("Only JPEG, PNG and WEBP images are allowed");
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
                    throw new IllegalArgumentException(
                            "Unsupported document type: " + document.getContentType()
                    );
                }
                String url = fileStorageService.storeFile(document);
                SectionDocs sectionDoc = SectionDocs.builder().fileName(document.getOriginalFilename()).fileUrl(url).section(savedSection).build();

                sectionDocsRepository.save(sectionDoc);

                savedSection.getSectionDocs().add(sectionDoc);
            }
        }


        return toResponse(sectionRepository.findById(savedSection.getId()).orElseThrow(() -> new NotFoundException("Section Not Found")));
    }

    @Transactional
    public SectionResponse updateSection(Long id, String title, String content, Long categoryId, Boolean visibility, List<MultipartFile> documents) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is required");
        }

        Section existingSection = getSectionEntity(id);
        requireOwnerOrAdmin(existingSection, "edit");
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category Not Found!"));

        existingSection.setTitle(title);
        existingSection.setContent(content);
        existingSection.setVisibility(visibility != null ? visibility : existingSection.getVisibility());
        existingSection.setCategory(category);

        Section savedSection = sectionRepository.save(existingSection);

        if (documents != null) {
            for (MultipartFile document : documents) {
                if (!ALLOWED_DOCUMENT_TYPES.contains(document.getContentType())) {
                    throw new IllegalArgumentException(
                            "Unsupported document type: " + document.getContentType()
                    );
                }
                String url = fileStorageService.storeFile(document);
                SectionDocs sectionDoc = SectionDocs.builder().fileName(document.getOriginalFilename()).fileUrl(url).section(savedSection).build();

                sectionDocsRepository.save(sectionDoc);
                savedSection.getSectionDocs().add(sectionDoc);
            }
        }

        return toResponse(sectionRepository.findById(savedSection.getId()).orElseThrow(() -> new NotFoundException("Section Not Found")));
    }
    public void  deleteSection(Long id){

        Section existingSection = getSectionEntity(id);
        requireOwnerOrAdmin(existingSection, "delete");

        sectionRepository.deleteById(id);
    }

    @Transactional
    public SectionResponse deleteSectionDocument(Long sectionId, Long documentId) {
        Section section = getSectionEntity(sectionId);
        requireOwnerOrAdmin(section, "edit");

        SectionDocs document = sectionDocsRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found"));

        if (document.getSection() == null || !document.getSection().getId().equals(sectionId)) {
            throw new NotFoundException("Document not found");
        }

        section.getSectionDocs().remove(document);
        sectionDocsRepository.delete(document);
        fileStorageService.deleteFile(document.getFileUrl());

        return toResponse(sectionRepository.findById(sectionId).orElseThrow(() -> new NotFoundException("Section Not Found")));
    }
    @Transactional
    public SectionResponse  patchSection(Long id, SectionPatchRequest request){

        Section existingSection = getSectionEntity(id);
        requireOwnerOrAdmin(existingSection, "edit");

        if(request.getTitle() != null){
            existingSection.setTitle(request.getTitle());
        }

        if(request.getContent() != null){
            existingSection.setContent(request.getContent());
        }

        if(request.getVisibility() != null){
            existingSection.setVisibility(request.getVisibility());
        }

        if(request.getCategoryId() != null){
            Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Category Not Found!"));
            existingSection.setCategory(category);
        }

        if(request.getImportant() != null){
            existingSection.setImportant(request.getImportant());
        }

        return toResponse(sectionRepository.save(existingSection));
    }

    private SectionResponse toResponse(Section section) {

        return SectionResponse.builder()
                .id(section.getId())
                .title(section.getTitle())
                .content(section.getContent())
                .visibility(section.getVisibility())
                .important(section.getImportant())
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
                        new NotFoundException("Section Not Found"));
    }

    public List<SectionResponse> getSectionsByCategory(Long categoryId) {
        return sectionRepository.findByCategoryIdOrderByImportantDescCreatedAtDesc(categoryId)
                .stream().map(this::toResponse).toList();
    }
}
