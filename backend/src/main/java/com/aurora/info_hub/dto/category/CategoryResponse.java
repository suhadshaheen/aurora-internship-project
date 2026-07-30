package com.aurora.info_hub.dto.category;

import com.aurora.info_hub.dto.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String catName;
    private LocalDateTime createdAt;
    private UserResponse createdBy;

}