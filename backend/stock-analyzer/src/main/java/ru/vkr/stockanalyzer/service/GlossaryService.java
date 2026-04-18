package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.dto.glossary.GlossaryDto;
import ru.vkr.stockanalyzer.entity.Glossary;
import ru.vkr.stockanalyzer.exception.StockNotFoundException;
import ru.vkr.stockanalyzer.repository.GlossaryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GlossaryService {

    private final GlossaryRepository glossaryRepository;

    public List<GlossaryDto> getAll(String category, String query) {
        List<Glossary> terms;

        if (query != null && !query.isBlank()) {
            terms = glossaryRepository.findByTermContainingIgnoreCase(query);
        } else if (category != null && !category.isBlank()) {
            terms = glossaryRepository.findAllByCategory(category);
        } else {
            terms = glossaryRepository.findAll();
        }

        return terms.stream()
                .map(this::toDto)
                .toList();
    }

    public GlossaryDto getByTerm(String term) {
        return glossaryRepository.findByTermIgnoreCase(term)
                .map(this::toDto)
                .orElseThrow(() -> new StockNotFoundException("Термин не найден: " + term));
    }

    private GlossaryDto toDto(Glossary g) {
        return GlossaryDto.builder()
                .id(g.getId())
                .term(g.getTerm())
                .definition(g.getDefinition())
                .example(g.getExample())
                .category(g.getCategory())
                .build();
    }
}