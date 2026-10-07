package com.spendwise.backend.expense;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    Optional<Expense> findByIdAndUserId(Long id, Long userId);
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
    long countByCategoryId(Long categoryId);
}
