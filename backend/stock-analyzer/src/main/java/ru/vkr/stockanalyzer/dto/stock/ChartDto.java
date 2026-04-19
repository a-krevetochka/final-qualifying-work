package ru.vkr.stockanalyzer.dto.stock;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChartDto {
    private String date;
    private Double open;
    private Double close;
    private Double high;
    private Double low;
    private Long   volume;
}