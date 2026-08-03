package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByParentCommentIsNull();

}