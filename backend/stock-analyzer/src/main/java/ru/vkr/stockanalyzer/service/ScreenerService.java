package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.client.MlClient;
import ru.vkr.stockanalyzer.dto.screener.ScreenerFilterDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerResultDto;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreenerService {

    private final MlClient mlClient;

    public List<ScreenerResultDto> screen(ScreenerFilterDto filter) {
        return mlClient.screen(filter);
    }
}