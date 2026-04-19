package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.client.MlClient;
import ru.vkr.stockanalyzer.dto.screener.ScreenerFilterDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerPageDto;

@Service
@RequiredArgsConstructor
public class ScreenerService {

    private final MlClient mlClient;

    public ScreenerPageDto screen(ScreenerFilterDto filter) {
        return mlClient.screen(filter);
    }
}