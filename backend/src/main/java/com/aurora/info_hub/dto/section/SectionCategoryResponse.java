package com.aurora.info_hub.dto.section;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionCategoryResponse {

    private Long id;
    private String catName;

}