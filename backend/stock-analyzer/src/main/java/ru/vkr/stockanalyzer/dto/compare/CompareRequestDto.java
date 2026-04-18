package ru.vkr.stockanalyzer.dto.compare;

import lombok.Data;

import java.util.List;

@Data
public class CompareRequestDto {
    private List<String> tickers;
}