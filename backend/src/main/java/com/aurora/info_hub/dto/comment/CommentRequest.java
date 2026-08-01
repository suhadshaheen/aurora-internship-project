package com.aurora.info_hub.dto.comment;

import lombok.Data;

@Data
public class CommentRequest {

    private String content;

    private Long sectionId;

    private Long parentCommentId;
}