package ru.vkr.stockanalyzer.dto.compare;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockCompareItemDto {
    private String ticker;
    private Double currentPrice;
    private String signal10d;
    private Double grahamScore;
    private String grahamInterpretation;
    private Double peRatio;
    private Double pbRatio;
    private Double roe;
    private Double divYield;
    private Double debtToEquity;
}