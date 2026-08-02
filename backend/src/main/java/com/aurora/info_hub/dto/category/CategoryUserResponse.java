package com.aurora.info_hub.dto.category;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryUserResponse {

    private Long id;
    private String userHandle;
    private String role;

}