package ru.vkr.stockanalyzer.dto.stock;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockPriceDto {
    private String ticker;
    private Double price;
    private Double change;
    private Double changePct;
    private Long   volume;
    private String updatedAt;
}