package ru.vkr.stockanalyzer.dto.glossary;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlossaryDto {
    private Long   id;
    private String term;
    private String definition;
    private String example;
    private String category;
}