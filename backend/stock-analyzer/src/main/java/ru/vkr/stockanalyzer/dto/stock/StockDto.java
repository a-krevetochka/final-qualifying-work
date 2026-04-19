package ru.vkr.stockanalyzer.dto.stock;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockDto {
    private String ticker;
    private String name;
    private String sector;
    private Double price;
    private Double priceChange;
    private Double marketCap;
}