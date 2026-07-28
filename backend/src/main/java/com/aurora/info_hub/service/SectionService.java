package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.repository.SectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {
    private final SectionRepository sectionRepository;
    public SectionService(SectionRepository sectionRepositry) {
        this.sectionRepository = sectionRepositry;
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }
public  Section getSectionById(Long id) {
    sectionRepository.findById(id).orElseThrow(()->new RuntimeException("Section Not Found!"));
        return sectionRepository.findById(id).get();
}
public Section createSection(Section section) {

    return   sectionRepository.save(section);
}
    public Section updateSection(Long id, Section section){

        Section existingSection = getSectionById(id);

        existingSection.setTitle(section.getTitle());
        existingSection.setContent(section.getContent());
        existingSection.setVisibility(section.isVisible());
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
