package com.aurora.info_hub.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentUpdateRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}
