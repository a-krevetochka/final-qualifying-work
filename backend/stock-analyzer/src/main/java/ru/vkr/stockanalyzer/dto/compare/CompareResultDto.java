package ru.vkr.stockanalyzer.dto.compare;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CompareResultDto {
    private List<String>             tickers;
    private List<StockCompareItemDto> items;
}