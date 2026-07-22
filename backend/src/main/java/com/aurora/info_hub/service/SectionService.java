package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.repository.SectionRepositry;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {
    private final SectionRepositry sectionRepositry;
    public SectionService(SectionRepositry sectionRepositry) {
        this.sectionRepositry = sectionRepositry;
    }

    public List<Section> getAllSections() {
        return sectionRepositry.findAll();
    }
public  Section getSectionById(long id) {
        sectionRepositry.findById(id).orElseThrow(()->new RuntimeException("Section Not Found!"));
        return sectionRepositry.findById(id).get();
}
public Section createSection(Section section) {

    return   sectionRepositry.save(section);
}
}
