package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.client.MlClient;
import ru.vkr.stockanalyzer.dto.compare.CompareRequestDto;
import ru.vkr.stockanalyzer.dto.compare.CompareResultDto;
import ru.vkr.stockanalyzer.dto.compare.StockCompareItemDto;
import ru.vkr.stockanalyzer.entity.Comparison;
import ru.vkr.stockanalyzer.entity.User;
import ru.vkr.stockanalyzer.exception.StockNotFoundException;
import ru.vkr.stockanalyzer.repository.ComparisonRepository;
import ru.vkr.stockanalyzer.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompareService {

    private final MlClient             mlClient;
    private final ComparisonRepository comparisonRepository;
    private final UserRepository       userRepository;

    public CompareResultDto compare(CompareRequestDto request, UserDetails userDetails) {
        if (request.getTickers().size() < 2 || request.getTickers().size() > 3) {
            throw new IllegalArgumentException("Можно сравнивать от 2 до 3 акций");
        }

        List<StockCompareItemDto> items = request.getTickers().stream()
                .map(mlClient::getCompareItem)
                .toList();

        if (userDetails != null) {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (user != null) {
                Comparison comparison = Comparison.builder()
                        .user(user)
                        .tickers(request.getTickers())
                        .build();
                comparisonRepository.save(comparison);
            }
        }

        return CompareResultDto.builder()
                .tickers(request.getTickers())
                .items(items)
                .build();
    }

    public List<CompareResultDto> getHistory(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return comparisonRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(c -> CompareResultDto.builder()
                        .tickers(c.getTickers())
                        .items(c.getTickers().stream()
                                .map(mlClient::getCompareItem)
                                .toList())
                        .build())
                .toList();
    }

    public void delete(Long id, UserDetails userDetails) {
        Comparison comparison = comparisonRepository.findById(id)
                .orElseThrow(() -> new StockNotFoundException("Сравнение не найдено"));

        if (!comparison.getUser().getEmail().equals(userDetails.getUsername())) {
            throw new RuntimeException("Нет доступа");
        }

        comparisonRepository.deleteById(id);
    }
}