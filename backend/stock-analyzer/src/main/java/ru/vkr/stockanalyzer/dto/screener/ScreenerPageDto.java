package ru.vkr.stockanalyzer.dto.screener;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ScreenerPageDto {
    private int                  total;
    private int                  page;
    private int                  size;
    private List<ScreenerResultDto> results;
}