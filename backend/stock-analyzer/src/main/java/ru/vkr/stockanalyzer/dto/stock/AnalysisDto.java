package ru.vkr.stockanalyzer.dto.stock;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalysisDto {
    private String ticker;
    private Double currentPrice;
    private String lastDate;

    private String signal3d;
    private String signal5d;
    private String signal10d;
    private String signal30d;

    private Double grahamScore;
    private String grahamInterpretation;

    private String consensusRecommendation;
    private Double targetPrice;

    private Double peRatio;
    private Double pbRatio;
    private Double roe;
    private Double roa;
    private Double netMargin;
    private Double debtToEquity;
    private Double divYield;
}