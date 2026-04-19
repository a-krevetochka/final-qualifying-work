package ru.vkr.stockanalyzer.dto.favorite;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FavoriteDto {
    private String        ticker;
    private String        companyName;
    private LocalDateTime addedAt;
}