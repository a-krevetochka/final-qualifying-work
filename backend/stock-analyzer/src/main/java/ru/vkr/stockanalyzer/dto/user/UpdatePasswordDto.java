package ru.vkr.stockanalyzer.dto.user;

import lombok.Data;

@Data
public class UpdatePasswordDto {
    private String oldPassword;
    private String newPassword;
}