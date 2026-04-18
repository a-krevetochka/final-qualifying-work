package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.glossary.GlossaryDto;
import ru.vkr.stockanalyzer.service.GlossaryService;

import java.util.List;

@RestController
@RequestMapping("/api/glossary")
@RequiredArgsConstructor
public class GlossaryController {

    private final GlossaryService glossaryService;

    @GetMapping
    public ResponseEntity<List<GlossaryDto>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(glossaryService.getAll(category, q));
    }

    @GetMapping("/{term:.+}")
    public ResponseEntity<GlossaryDto> getByTerm(@PathVariable String term) {
        return ResponseEntity.ok(glossaryService.getByTerm(term));
    }
}