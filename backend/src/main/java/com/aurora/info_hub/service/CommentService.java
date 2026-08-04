package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.comment.CommentRequest;
import com.aurora.info_hub.dto.comment.CommentResponse;
import com.aurora.info_hub.entity.Comment;
import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.CommentRepository;
import com.aurora.info_hub.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.aurora.info_hub.repository.SectionRepository;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aurora.info_hub.entity.User;
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
    public List<CommentResponse> getAllComments() {
    return commentRepository.findByParentCommentIsNull()
            .stream()
            .map(this::mapToResponse)
            .toList();
}



    // GET comment by id
   public CommentResponse getCommentById(Long id) {

    Comment comment = commentRepository.findById(id)
            .orElseThrow(() ->
                    new NotFoundException("Comment not found"));

    return mapToResponse(comment);
}



    // POST add comment
   public CommentResponse createComment(CommentRequest request) {
    Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    User currentUser = userRepository.findByEmail(email)
        .orElseThrow(() ->
                new NotFoundException("User not found"));

    Comment comment = new Comment();

    comment.setContent(request.getContent());

    Section section = sectionRepository.findById(request.getSectionId())
            .orElseThrow(() ->
                    new NotFoundException("Section not found"));

    comment.setCreatedBy(currentUser);
    comment.setCreatedIn(section);

    if (request.getParentCommentId() != null) {

        Comment parent = commentRepository.findById(
                request.getParentCommentId()
        ).orElseThrow(() ->
                new NotFoundException("Parent comment not found"));

        comment.setParentComment(parent);
    }

    Comment savedComment = commentRepository.save(comment);

    return mapToResponse(savedComment);
}
    // PUT update comment
  public CommentResponse updateComment(Long id, CommentRequest request) {

    Comment comment = getCommentEntity(id);

    comment.setContent(request.getContent());

    Comment updated = commentRepository.save(comment);

    return mapToResponse(updated);
}



    
    public void deleteComment(Long id){

    Comment comment = getCommentEntity(id);

    commentRepository.delete(comment);
}

    private Comment getCommentEntity(Long id) {

    return commentRepository.findById(id)
            .orElseThrow(() ->
                    new NotFoundException("Comment not found"));
}

    private CommentResponse mapToResponse(Comment comment) {
    return CommentResponse.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .createdById(comment.getCreatedBy().getId())
            .createdByName(comment.getCreatedBy().getUserHandle())
            .sectionId(comment.getCreatedIn().getId())
            .dateCreated(comment.getDateCreated())
            .children(
                    comment.getChildren() == null
                            ? List.of()
                            : comment.getChildren()
                                    .stream()
                                    .map(this::mapToResponse)
                                    .toList()
            )
            .build();
}

}