package ru.vkr.stockanalyzer.dto.screener;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScreenerResultDto {
    private String ticker;
    private Double currentPrice;
    private Double grahamScore;
    private String interpretation;
    private String signal10d;
    private Double peRatio;
    private Double divYield;
}