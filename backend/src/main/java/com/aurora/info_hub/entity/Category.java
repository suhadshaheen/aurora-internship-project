package com.aurora.info_hub.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    String catName;
     @ManyToOne
     @JoinColumn(name = "user_id", nullable = false)
     private User createdBy;
       @Column(updatable = false)
    private LocalDateTime dateCreated;

    @PrePersist
    protected void onCreate() {
        this.dateCreated = LocalDateTime.now();
    } 

    @OneToMany(mappedBy = "category")
    private List<Section> sections;



}
