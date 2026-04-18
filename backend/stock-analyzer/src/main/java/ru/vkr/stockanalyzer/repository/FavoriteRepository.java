package ru.vkr.stockanalyzer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import ru.vkr.stockanalyzer.entity.Favorite;
import ru.vkr.stockanalyzer.entity.User;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findAllByUser(User user);
    Optional<Favorite> findByUserAndTicker(User user, String ticker);
    boolean existsByUserAndTicker(User user, String ticker);

    @Transactional
    void deleteByUserAndTicker(User user, String ticker);
}