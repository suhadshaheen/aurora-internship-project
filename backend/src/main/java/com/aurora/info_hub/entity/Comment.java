package com.aurora.info_hub.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String content;
    @OneToMany
    @JoinColumn(name = "parent_comment_id", nullable = true)
    private Comment parentComment;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;
   @Column(updatable = false)
    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        this.dateCreated = LocalDateTime.now();
    } 
    @OneToMany
    @JoinColumn(name = "section_id",nullable = false)
    private Section createdIn;


}
