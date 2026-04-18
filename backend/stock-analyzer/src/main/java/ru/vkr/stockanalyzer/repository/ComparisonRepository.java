package ru.vkr.stockanalyzer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vkr.stockanalyzer.entity.Comparison;
import ru.vkr.stockanalyzer.entity.User;

import java.util.List;

public interface ComparisonRepository extends JpaRepository<Comparison, Long> {
    List<Comparison> findAllByUserOrderByCreatedAtDesc(User user);
    List<Comparison> findAllByUserIsNull();
}