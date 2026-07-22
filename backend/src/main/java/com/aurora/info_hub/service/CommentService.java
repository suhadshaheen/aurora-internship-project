package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Comment;
import com.aurora.info_hub.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {


    private final CommentRepository commentRepository;


    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }


 
    // GET all comments
    public List<Comment> getAllComments(){

        return commentRepository.findAll();
    }



    // GET comment by id
    public Comment getCommentById(Long id){

        return commentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Comment not found"));
    }



    // POST add comment
    public Comment createComment(Comment comment){

        return commentRepository.save(comment);
    }



    // PUT update comment
    public Comment updateComment(Long id, Comment comment){


        Comment existingComment = getCommentById(id);

    existingComment.setContent(comment.getContent());
    existingComment.setParentComment(comment.getParentComment());
    existingComment.setCreatedBy(comment.getCreatedBy());
    existingComment.setCreatedIn(comment.getCreatedIn());


        return commentRepository.save(existingComment);
    }



    
    public void deleteComment(Long id){

        Comment comment = getCommentById(id);

        commentRepository.delete(comment);
    }

}