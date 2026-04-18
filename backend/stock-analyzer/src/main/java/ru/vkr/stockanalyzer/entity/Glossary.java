package ru.vkr.stockanalyzer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "glossary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Glossary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String term;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column
    private String category;
}