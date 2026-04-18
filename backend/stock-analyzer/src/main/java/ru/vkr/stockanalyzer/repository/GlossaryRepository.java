package ru.vkr.stockanalyzer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vkr.stockanalyzer.entity.Glossary;

import java.util.List;
import java.util.Optional;

public interface GlossaryRepository extends JpaRepository<Glossary, Long> {
    Optional<Glossary> findByTermIgnoreCase(String term);
    List<Glossary> findAllByCategory(String category);
    List<Glossary> findByTermContainingIgnoreCase(String query);
}