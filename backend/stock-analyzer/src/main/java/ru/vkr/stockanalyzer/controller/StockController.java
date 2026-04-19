package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.stock.*;
import ru.vkr.stockanalyzer.service.StockService;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/search")
    public ResponseEntity<List<StockSearchDto>> search(@RequestParam String q) {
        return ResponseEntity.ok(stockService.search(q));
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<StockDto> getStock(@PathVariable String ticker) {
        return ResponseEntity.ok(stockService.getStock(ticker.toUpperCase()));
    }

    @GetMapping("/{ticker}/chart")
    public ResponseEntity<List<ChartDto>> getChart(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "3M") String period) {
        return ResponseEntity.ok(stockService.getChart(ticker.toUpperCase(), period));
    }

    @GetMapping("/{ticker}/analysis")
    public ResponseEntity<AnalysisDto> getAnalysis(@PathVariable String ticker) {
        return ResponseEntity.ok(stockService.getAnalysis(ticker.toUpperCase()));
    }

    @GetMapping("/{ticker}/price")
    public ResponseEntity<StockPriceDto> getPrice(@PathVariable String ticker) {
        return ResponseEntity.ok(stockService.getPrice(ticker.toUpperCase()));
    }
}