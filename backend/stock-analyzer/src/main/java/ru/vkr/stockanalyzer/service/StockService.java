package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.client.MlClient;
import ru.vkr.stockanalyzer.client.MoexClient;
import ru.vkr.stockanalyzer.dto.stock.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final MoexClient moexClient;
    private final MlClient   mlClient;

    public List<StockSearchDto> search(String query) {
        return moexClient.search(query);
    }

    @Cacheable(value = "stocks", key = "#ticker")
    public StockDto getStock(String ticker) {
        return moexClient.getStock(ticker);
    }

    public List<ChartDto> getChart(String ticker, String period) {
        int days = switch (period) {
            case "1M"  -> 30;
            case "3M"  -> 90;
            case "6M"  -> 180;
            case "1Y"  -> 365;
            default    -> 90;
        };
        return moexClient.getCandles(ticker, days);
    }

    @Cacheable(value = "analysis", key = "#ticker")
    public AnalysisDto getAnalysis(String ticker) {
        return mlClient.getAnalysis(ticker);
    }

    public StockPriceDto getPrice(String ticker) {
        return moexClient.getPrice(ticker);
    }
}