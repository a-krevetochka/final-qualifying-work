package ru.vkr.stockanalyzer.dto.stock;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockSearchDto {
    private String ticker;
    private String name;
}