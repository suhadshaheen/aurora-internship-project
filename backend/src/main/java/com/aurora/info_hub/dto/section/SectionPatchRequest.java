package com.aurora.info_hub.dto.section;

import lombok.Data;

@Data
public class SectionPatchRequest {
    private String title;
    private String content;
    private Boolean visibility;
    private Long categoryId;
}