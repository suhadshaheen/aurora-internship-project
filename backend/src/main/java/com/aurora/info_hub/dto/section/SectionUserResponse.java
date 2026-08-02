package com.aurora.info_hub.dto.section;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionUserResponse {

    private Long id;
    private String userHandle;
    private String role;

}