package ru.vkr.stockanalyzer.dto.screener;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScreenerFilterDto {
    private String sector;
    private Double peMax;
    private Double divMin;
    private String signal;
    private String sort;
    private int    page;
    private int    size;
}