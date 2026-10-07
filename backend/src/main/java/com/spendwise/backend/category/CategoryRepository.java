package com.spendwise.backend.category;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByUserIdAndNameIgnoreCase(Long userId, String name);
    List<Category> findByUserIdOrderByNameAsc(Long userId);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
