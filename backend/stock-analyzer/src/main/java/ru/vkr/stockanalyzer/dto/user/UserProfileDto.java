package ru.vkr.stockanalyzer.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDto {
    private Long          id;
    private String        email;
    private String        username;
    private LocalDateTime createdAt;
}