package com.spendwise.backend.dashboard;

import com.spendwise.backend.expense.ExpenseDtos;
import java.math.BigDecimal;
import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {}
    public record MonthlySpending(String month, BigDecimal amount) {}
    public record CategorySpending(String category, String color, BigDecimal amount, BigDecimal percentage) {}
    public record SummaryResponse(BigDecimal totalSpent, BigDecimal monthlySpent,
                                  BigDecimal monthlyBudget, BigDecimal remaining,
                                  String month, List<MonthlySpending> monthlySpending,
                                  List<CategorySpending> categorySpending,
                                  List<ExpenseDtos.ExpenseResponse> recentExpenses) {}
}
