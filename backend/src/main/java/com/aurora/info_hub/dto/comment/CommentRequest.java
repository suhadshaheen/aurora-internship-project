package com.aurora.info_hub.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    @NotNull(message = "Section is required")
    private Long sectionId;

    private Long parentCommentId;
}
