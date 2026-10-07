package com.spendwise.backend.dashboard;

import com.spendwise.backend.expense.Expense;
import com.spendwise.backend.expense.ExpenseDtos;
import com.spendwise.backend.expense.ExpenseRepository;
import com.spendwise.backend.budget.Budget;
import com.spendwise.backend.budget.BudgetRepository;
import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DashboardService {
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
    private final ExpenseRepository expenses;
    private final UserRepository users;
    private final BudgetRepository budgets;
    private final Clock clock;

    @Autowired
    public DashboardService(ExpenseRepository expenses, UserRepository users, BudgetRepository budgets) {
        this(expenses, users, budgets, Clock.systemDefaultZone());
    }
    DashboardService(ExpenseRepository expenses, UserRepository users, BudgetRepository budgets, Clock clock) {
        this.expenses = expenses;
        this.users = users;
        this.budgets = budgets;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardDtos.SummaryResponse summary(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        List<Expense> userExpenses = expenses.findByUserIdOrderByDateDesc(user.getId());
        YearMonth currentMonth = YearMonth.now(clock);
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate nextMonthStart = currentMonth.plusMonths(1).atDay(1);

        BigDecimal totalSpent = userExpenses.stream().map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Expense> currentMonthExpenses = userExpenses.stream()
                .filter(expense -> !expense.getDate().isBefore(monthStart) && expense.getDate().isBefore(nextMonthStart))
                .toList();
        BigDecimal monthlySpent = sum(currentMonthExpenses);
        Budget monthlyBudgetRecord = budgets.findByUserIdAndYearAndMonthAndCategoryIsNull(
                user.getId(), currentMonth.getYear(), currentMonth.getMonthValue()).orElse(null);
        BigDecimal monthlyBudget = monthlyBudgetRecord == null ? null : monthlyBudgetRecord.getAmount();
        BigDecimal remaining = monthlyBudget == null ? null : monthlyBudget.subtract(monthlySpent);

        Map<YearMonth, BigDecimal> totalsByMonth = new LinkedHashMap<>();
        for (int offset = 5; offset >= 0; offset--) totalsByMonth.put(currentMonth.minusMonths(offset), BigDecimal.ZERO);
        for (Expense expense : userExpenses) {
            YearMonth month = YearMonth.from(expense.getDate());
            if (totalsByMonth.containsKey(month)) totalsByMonth.compute(month, (key, total) -> total.add(expense.getAmount()));
        }
        List<DashboardDtos.MonthlySpending> monthlySpending = totalsByMonth.entrySet().stream()
                .map(entry -> new DashboardDtos.MonthlySpending(entry.getKey().format(MONTH_LABEL), entry.getValue()))
                .toList();

        Map<String, List<Expense>> byCategory = new LinkedHashMap<>();
        currentMonthExpenses.stream().sorted(Comparator.comparing(expense -> expense.getCategory().getName()))
                .forEach(expense -> byCategory.computeIfAbsent(expense.getCategory().getName(), key -> new ArrayList<>()).add(expense));
        List<DashboardDtos.CategorySpending> categorySpending = byCategory.entrySet().stream().map(entry -> {
            Expense sample = entry.getValue().getFirst();
            BigDecimal amount = sum(entry.getValue());
            BigDecimal percentage = monthlySpent.signum() == 0 ? BigDecimal.ZERO
                    : amount.multiply(BigDecimal.valueOf(100)).divide(monthlySpent, 1, RoundingMode.HALF_UP);
            return new DashboardDtos.CategorySpending(entry.getKey(), sample.getCategory().getColor(), amount, percentage);
        }).toList();

        List<ExpenseDtos.ExpenseResponse> recentExpenses = userExpenses.stream().limit(5)
                .map(ExpenseDtos.ExpenseResponse::from).toList();
        return new DashboardDtos.SummaryResponse(totalSpent, monthlySpent, monthlyBudget, remaining,
                currentMonth.toString(), monthlySpending, categorySpending, recentExpenses);
    }

    private BigDecimal sum(List<Expense> items) {
        return items.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
