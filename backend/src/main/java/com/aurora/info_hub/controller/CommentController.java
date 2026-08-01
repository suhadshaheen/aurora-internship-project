package com.aurora.info_hub.controller;
import com.aurora.info_hub.dto.comment.CommentRequest;
import com.aurora.info_hub.dto.comment.CommentResponse;


import com.aurora.info_hub.service.CommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {


    private final CommentService commentService;


    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }



    
    @GetMapping
   public List<CommentResponse> getAllComments(){

        return commentService.getAllComments();
    }



   
    @GetMapping("/{id}")
public CommentResponse getCommentById(@PathVariable Long id) {
    return commentService.getCommentById(id);
}



    
    @PostMapping
public CommentResponse addComment(
        @RequestBody CommentRequest request
) {
    return commentService.createComment(request);
}



   
    @PutMapping("/{id}")
public CommentResponse updateComment(
        @PathVariable Long id,
        @RequestBody CommentRequest request
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