package com.aurora.info_hub.dto.section;

import com.aurora.info_hub.dto.category.CategoryResponse;
import com.aurora.info_hub.dto.user.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
@Data
@Builder
public class SectionResponse {

    private Long id;

    private String title;

    private String content;

    private Boolean visibility;

    private LocalDateTime createdAt;

    private SectionCategoryResponse category;
    private SectionUserResponse createdBy;

    private List<SectionImageResponse> images;

    private List<SectionDocResponse> documents;
}