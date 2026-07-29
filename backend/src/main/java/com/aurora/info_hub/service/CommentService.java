package com.aurora.info_hub.service;

import com.aurora.info_hub.entity.Comment;

import com.aurora.info_hub.repository.CommentRepository;
import com.aurora.info_hub.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.aurora.info_hub.repository.SectionRepository;
import java.util.List;

@Service
public class CommentService {


    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, SectionRepository sectionRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.sectionRepository = sectionRepository;
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

        if(comment.getContent() == null || comment.getContent().isBlank()){
    throw new RuntimeException("Comment content cannot be empty");
}
     userRepository.findById(
        comment.getCreatedBy().getId()
     ).orElseThrow(() ->
        new RuntimeException("User not found"));
       

       sectionRepository.findById(
        comment.getCreatedIn().getId()
).orElseThrow(() ->
        new RuntimeException("Section not found"));

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