package com.aurora.info_hub.dto.comment;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse {

    private Long id;

    private String content;

    private Long createdById;

    private String createdByName;

    private Long sectionId;

    private Long parentCommentId;

    private LocalDateTime dateCreated;

    private List<CommentResponse> children;
}