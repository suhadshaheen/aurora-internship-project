package com.aurora.info_hub.controller;
import com.aurora.info_hub.dto.comment.CommentRequest;
import com.aurora.info_hub.dto.comment.CommentResponse;
import com.aurora.info_hub.dto.comment.CommentUpdateRequest;


import com.aurora.info_hub.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/comments")
public class CommentController {


    private final CommentService commentService;


    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }



    
    @GetMapping
   public List<CommentResponse> getAllComments(@RequestParam(value = "sectionId", required = false) Long sectionId){

        if (sectionId != null) {
            return commentService.getCommentsBySection(sectionId);
        }
        return commentService.getAllComments();
    }



   
    @GetMapping("/{id}")
public CommentResponse getCommentById(@PathVariable Long id) {
    return commentService.getCommentById(id);
}



    
    @PostMapping
public CommentResponse addComment(
        @Valid @RequestBody CommentRequest request
) {
    return commentService.createComment(request);
}



   
    @PatchMapping("/{id}")
public CommentResponse updateComment(
        @PathVariable Long id,
        @Valid @RequestBody CommentUpdateRequest request
) {
    return commentService.updateComment(id, request);
}



   
    @DeleteMapping("/{id}")
    public void deleteComment(
            @PathVariable Long id
    ){

        commentService.deleteComment(id);
    }

}