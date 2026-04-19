package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.screener.ScreenerFilterDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerPageDto;
import ru.vkr.stockanalyzer.service.ScreenerService;

import java.util.List;

@RestController
@RequestMapping("/api/screener")
@RequiredArgsConstructor
public class ScreenerController {

    private final ScreenerService screenerService;

    @GetMapping
    public ResponseEntity<ScreenerPageDto> screen(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) Double peMax,
            @RequestParam(required = false) Double divMin,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        ScreenerFilterDto filter = ScreenerFilterDto.builder()
                .sector(sector)
                .peMax(peMax)
                .divMin(divMin)
                .sort(sort)
                .page(page)
                .size(size)
                .build();

        return ResponseEntity.ok(screenerService.screen(filter));
    }
}