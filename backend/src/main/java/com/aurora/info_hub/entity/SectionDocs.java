package com.aurora.info_hub.entity;

import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Column;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "section_docs")
@Builder
public class SectionDocs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String fileName;
    @Column(nullable = false)
    private String fileUrl;

    @OneToMany(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "section_id", referencedColumnName = "id")
    private Section section;
}
