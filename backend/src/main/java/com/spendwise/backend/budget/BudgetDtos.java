package com.spendwise.backend.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public final class BudgetDtos {
    private BudgetDtos() {}
    public record BudgetRequest(@NotNull @DecimalMin("0.001") @Digits(integer = 9, fraction = 3) BigDecimal amount,
                                @Min(1) @Max(12) int month, @Min(2000) @Max(2100) int year,
                                Long categoryId) {}
    public record BudgetResponse(Long id, BigDecimal amount, int month, int year,
                                 Long categoryId, String categoryName, BigDecimal spent,
                                 BigDecimal remaining, BigDecimal percentage, String status) {}
}
