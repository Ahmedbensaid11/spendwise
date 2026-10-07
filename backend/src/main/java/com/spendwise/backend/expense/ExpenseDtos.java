package com.spendwise.backend.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public final class ExpenseDtos {
    private ExpenseDtos() {}
    public record ExpenseRequest(@NotNull @DecimalMin(value = "0.001") @Digits(integer = 9, fraction = 3) BigDecimal amount,
                                 @NotBlank @Size(max = 200) String description,
                                 @NotNull LocalDate date,
                                 @NotBlank @Size(max = 60) String category) {}
    public record ExpenseResponse(Long id, BigDecimal amount, String description, LocalDate date,
                                  String category, Instant createdAt) {
        public static ExpenseResponse from(Expense expense) {
            return new ExpenseResponse(expense.getId(), expense.getAmount(), expense.getDescription(),
                    expense.getDate(), expense.getCategory().getName(), expense.getCreatedAt());
        }
    }
}
