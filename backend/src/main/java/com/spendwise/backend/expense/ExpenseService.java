package com.spendwise.backend.expense;

import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import com.spendwise.backend.category.Category;
import com.spendwise.backend.category.CategoryRepository;
import java.util.Map;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ExpenseService {
    private final ExpenseRepository expenses;
    private final UserRepository users;
    private final CategoryRepository categories;
    private static final Map<String, String> DEFAULT_CATEGORIES = Map.of(
            "Food", "#E7A17A", "Transport", "#7593AA", "Shopping", "#9A82B7",
            "Entertainment", "#DA8C9A", "Health", "#7BAE8C", "Education", "#D0A65D",
            "Bills", "#8E9AB0", "Other", "#97A29A");
    public ExpenseService(ExpenseRepository expenses, UserRepository users, CategoryRepository categories) {
        this.expenses = expenses;
        this.users = users;
        this.categories = categories;
    }

    public List<ExpenseDtos.ExpenseResponse> list(String email, String search, String category,
                                                   java.time.LocalDate fromDate, java.time.LocalDate toDate,
                                                   String sort, String direction) {
        User user = userFor(email);
        ensureDefaultCategories(user);
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");
        }
        Specification<Expense> specification = (root, query, builder) ->
                builder.equal(root.get("user").get("id"), user.getId());
        String normalizedCategory = blankToNull(category);
        if (normalizedCategory != null) {
            String categoryValue = normalizedCategory.toLowerCase(Locale.ROOT);
            specification = specification.and((root, query, builder) ->
                    builder.equal(builder.lower(root.join("category").get("name")), categoryValue));
        }
        String normalizedSearch = blankToNull(search);
        if (normalizedSearch != null) {
            String searchValue = "%" + normalizedSearch.toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, builder) ->
                    builder.like(builder.lower(root.get("description")), searchValue));
        }
        if (fromDate != null) {
            specification = specification.and((root, query, builder) ->
                    builder.greaterThanOrEqualTo(root.get("date"), fromDate));
        }
        if (toDate != null) {
            specification = specification.and((root, query, builder) ->
                    builder.lessThanOrEqualTo(root.get("date"), toDate));
        }
        var results = expenses.findAll(specification);
        Comparator<Expense> comparator = "amount".equalsIgnoreCase(sort)
                ? Comparator.comparing(Expense::getAmount)
                : Comparator.comparing(Expense::getDate).thenComparing(Expense::getId);
        if (!"asc".equalsIgnoreCase(direction)) comparator = comparator.reversed();
        return results.stream().sorted(comparator).map(ExpenseDtos.ExpenseResponse::from).toList();
    }

    public ExpenseDtos.ExpenseResponse create(String email, ExpenseDtos.ExpenseRequest request) {
        User user = userFor(email);
        ensureDefaultCategories(user);
        Expense expense = new Expense(request.amount(), request.description().trim(), request.date(), categoryFor(request.category(), user), user);
        return ExpenseDtos.ExpenseResponse.from(expenses.save(expense));
    }

    @Transactional(readOnly = true)
    public ExpenseDtos.ExpenseResponse get(String email, Long id) {
        User user = userFor(email);
        return ExpenseDtos.ExpenseResponse.from(ownedExpense(id, user.getId()));
    }

    public ExpenseDtos.ExpenseResponse update(String email, Long id, ExpenseDtos.ExpenseRequest request) {
        User user = userFor(email);
        Expense expense = ownedExpense(id, user.getId());
        expense.update(request.amount(), request.description().trim(), request.date(), categoryFor(request.category(), user));
        return ExpenseDtos.ExpenseResponse.from(expense);
    }

    public void delete(String email, Long id) {
        User user = userFor(email);
        expenses.delete(ownedExpense(id, user.getId()));
    }

    private User userFor(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
    private Category categoryFor(String name, User user) {
        return categories.findByUserIdAndNameIgnoreCase(user.getId(), name.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose one of your categories"));
    }
    private void ensureDefaultCategories(User user) {
        if (!categories.findByUserIdOrderByNameAsc(user.getId()).isEmpty()) return;
        DEFAULT_CATEGORIES.forEach((name, color) -> categories.findByUserIdAndNameIgnoreCase(user.getId(), name)
                .orElseGet(() -> categories.save(new Category(name, color, user))));
    }
    private Expense ownedExpense(Long id, Long userId) {
        return expenses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
