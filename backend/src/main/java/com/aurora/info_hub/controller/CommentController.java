package com.aurora.info_hub.controller;


import com.aurora.info_hub.entity.Comment;
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
    public List<Comment> getAllComments(){

        return commentService.getAllComments();
    }



   
    @GetMapping("/{id}")
    public Comment getCommentById(
            @PathVariable Long id
    ){

        return commentService.getCommentById(id);
    }



    
    @PostMapping
    public Comment addComment(
            @RequestBody Comment comment
    ){

        return commentService.createComment(comment);
    }



   
    @PutMapping("/{id}")
    public Comment updateComment(
            @PathVariable Long id,
            @RequestBody Comment comment
    ){

        return commentService.updateComment(id, comment);
    }



   
    @DeleteMapping("/{id}")
    public void deleteComment(
            @PathVariable Long id
    ){

        commentService.deleteComment(id);
    }

}