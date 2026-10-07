package com.spendwise.backend.budget;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndYearAndMonth(Long userId, int year, int month);
    Optional<Budget> findByUserIdAndYearAndMonthAndCategoryId(Long userId, int year, int month, Long categoryId);
    Optional<Budget> findByUserIdAndYearAndMonthAndCategoryIsNull(Long userId, int year, int month);
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
    long countByCategoryId(Long categoryId);
}
