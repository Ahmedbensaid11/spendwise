package com.spendwise.backend.budget;

import com.spendwise.backend.category.Category;
import com.spendwise.backend.category.CategoryRepository;
import com.spendwise.backend.expense.Expense;
import com.spendwise.backend.expense.ExpenseRepository;
import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class BudgetService {
    private final BudgetRepository budgets;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final ExpenseRepository expenses;
    public BudgetService(BudgetRepository budgets, UserRepository users, CategoryRepository categories, ExpenseRepository expenses) {
        this.budgets = budgets; this.users = users; this.categories = categories; this.expenses = expenses;
    }

    @Transactional(readOnly = true)
    public List<BudgetDtos.BudgetResponse> list(String email, int year, int month) {
        User user = userFor(email);
        List<Expense> monthExpenses = expenses.findByUserIdOrderByDateDesc(user.getId()).stream()
                .filter(expense -> YearMonth.from(expense.getDate()).equals(YearMonth.of(year, month))).toList();
        return budgets.findByUserIdAndYearAndMonth(user.getId(), year, month).stream()
                .map(budget -> toResponse(budget, monthExpenses)).toList();
    }

    public BudgetDtos.BudgetResponse create(String email, BudgetDtos.BudgetRequest request) {
        User user = userFor(email);
        Category category = categoryForUser(request.categoryId(), user.getId());
        if (budgets.findByUserIdAndYearAndMonthAndCategoryId(user.getId(), request.year(), request.month(), request.categoryId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A budget already exists for this month and category");
        }
        Budget budget = budgets.save(new Budget(request.amount(), request.month(), request.year(), category, user));
        return toResponse(budget, expensesFor(user.getId(), request.year(), request.month()));
    }

    public BudgetDtos.BudgetResponse update(String email, Long id, BudgetDtos.BudgetRequest request) {
        User user = userFor(email);
        Budget budget = budgets.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        Category category = categoryForUser(request.categoryId(), user.getId());
        budgets.findByUserIdAndYearAndMonthAndCategoryId(user.getId(), request.year(), request.month(), request.categoryId())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "A budget already exists for this month and category"); });
        budget.update(request.amount(), request.month(), request.year(), category);
        return toResponse(budget, expensesFor(user.getId(), request.year(), request.month()));
    }

    public void delete(String email, Long id) {
        User user = userFor(email);
        Budget budget = budgets.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        budgets.delete(budget);
    }

    @Transactional(readOnly = true)
    public Budget findCurrentMonthlyBudget(Long userId, YearMonth month) {
        return budgets.findByUserIdAndYearAndMonthAndCategoryIsNull(userId, month.getYear(), month.getMonthValue()).orElse(null);
    }

    private List<Expense> expensesFor(Long userId, int year, int month) {
        return expenses.findByUserIdOrderByDateDesc(userId).stream()
                .filter(expense -> YearMonth.from(expense.getDate()).equals(YearMonth.of(year, month))).toList();
    }
    private BudgetDtos.BudgetResponse toResponse(Budget budget, List<Expense> monthExpenses) {
        Category category = budget.getCategory();
        BigDecimal spent = monthExpenses.stream()
                .filter(expense -> category == null || expense.getCategory().getId().equals(category.getId()))
                .map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal percentage = spent.multiply(BigDecimal.valueOf(100)).divide(budget.getAmount(), 1, RoundingMode.HALF_UP);
        String status = percentage.compareTo(BigDecimal.valueOf(100)) >= 0 ? "EXCEEDED"
                : percentage.compareTo(BigDecimal.valueOf(80)) >= 0 ? "WARNING" : "NORMAL";
        return new BudgetDtos.BudgetResponse(budget.getId(), budget.getAmount(), budget.getMonth(), budget.getYear(),
                category == null ? null : category.getId(), category == null ? null : category.getName(),
                spent, budget.getAmount().subtract(spent), percentage, status);
    }
    private Category categoryForUser(Long categoryId, Long userId) {
        if (categoryId == null) return null;
        return categories.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose one of your categories"));
    }
    private User userFor(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
