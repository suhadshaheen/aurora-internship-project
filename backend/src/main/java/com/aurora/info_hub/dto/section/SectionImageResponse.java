package com.aurora.info_hub.dto.section;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionImageResponse {

    private Long id;

    private String imageUrl;

}
