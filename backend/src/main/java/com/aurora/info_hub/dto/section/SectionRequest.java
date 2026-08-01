package com.aurora.info_hub.dto.section;

import lombok.Data;

@Data
public class SectionRequest {

    private String title;
    private String content;
    private Long categoryId;
    private Boolean visibility;

}