package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.favorite.FavoriteDto;
import ru.vkr.stockanalyzer.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<FavoriteDto>> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.getFavorites(userDetails));
    }

    @PostMapping("/{ticker}")
    public ResponseEntity<FavoriteDto> addFavorite(
            @PathVariable String ticker,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.addFavorite(ticker.toUpperCase(), userDetails));
    }

    @DeleteMapping("/{ticker}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String ticker,
            @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.removeFavorite(ticker.toUpperCase(), userDetails);
        return ResponseEntity.noContent().build();
    }
}