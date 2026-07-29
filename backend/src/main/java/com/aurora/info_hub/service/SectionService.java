package com.aurora.info_hub.service;

import com.aurora.info_hub.FileStorageService;
import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.entity.SectionDocs;
import com.aurora.info_hub.entity.SectionImage;
import com.aurora.info_hub.repository.SectionDocsRepository;
import com.aurora.info_hub.repository.SectionImageRepository;
import com.aurora.info_hub.repository.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SectionService {
    private  final SectionDocsRepository sectionDocsRepository;
    private final SectionImageRepository sectionImageRepository;
    private final FileStorageService fileStorageService;
    private final SectionRepository sectionRepository;
    public SectionService(SectionDocsRepository sectionDocsRepository, SectionImageRepository sectionImageRepository, FileStorageService fileStorageService, SectionRepository sectionRepositry) {
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
    public Section createSection(String title, String content, List<MultipartFile> images, List<MultipartFile> documents) {

        Section section = Section.builder()
                .title(title)
                .content(content)
                .build();

        Section savedSection = sectionRepository.save(section);

        if (images != null) {
            for (MultipartFile image : images) {
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
