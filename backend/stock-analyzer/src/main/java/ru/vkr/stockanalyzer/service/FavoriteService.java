package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.client.MoexClient;
import ru.vkr.stockanalyzer.dto.favorite.FavoriteDto;
import ru.vkr.stockanalyzer.entity.Favorite;
import ru.vkr.stockanalyzer.entity.User;
import ru.vkr.stockanalyzer.repository.FavoriteRepository;
import ru.vkr.stockanalyzer.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository     userRepository;
    private final MoexClient         moexClient;

    public List<FavoriteDto> getFavorites(UserDetails userDetails) {
        User user = getUser(userDetails);
        return favoriteRepository.findAllByUser(user).stream()
                .map(f -> FavoriteDto.builder()
                        .ticker(f.getTicker())
                        .companyName(f.getCompanyName())
                        .addedAt(f.getAddedAt())
                        .build())
                .toList();
    }

    public FavoriteDto addFavorite(String ticker, UserDetails userDetails) {
        User user = getUser(userDetails);

        if (favoriteRepository.existsByUserAndTicker(user, ticker)) {
            throw new RuntimeException("Акция уже в избранном");
        }

        String companyName = moexClient.getCompanyName(ticker);

        Favorite favorite = Favorite.builder()
                .user(user)
                .ticker(ticker)
                .companyName(companyName)
                .build();

        favoriteRepository.save(favorite);

        return FavoriteDto.builder()
                .ticker(ticker)
                .companyName(companyName)
                .addedAt(favorite.getAddedAt())
                .build();
    }

    public void removeFavorite(String ticker, UserDetails userDetails) {
        User user = getUser(userDetails);
        favoriteRepository.deleteByUserAndTicker(user, ticker);
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }
}