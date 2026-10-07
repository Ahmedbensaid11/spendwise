package com.spendwise.backend.category;

import com.spendwise.backend.budget.BudgetRepository;
import com.spendwise.backend.expense.ExpenseRepository;
import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CategoryService {
    private static final Map<String, String> DEFAULTS = Map.of(
            "Food", "#E7A17A", "Transport", "#7593AA", "Shopping", "#9A82B7",
            "Entertainment", "#DA8C9A", "Health", "#7BAE8C", "Education", "#D0A65D",
            "Bills", "#8E9AB0", "Other", "#97A29A");
    private final CategoryRepository categories;
    private final UserRepository users;
    private final ExpenseRepository expenses;
    private final BudgetRepository budgets;
    public CategoryService(CategoryRepository categories, UserRepository users, ExpenseRepository expenses, BudgetRepository budgets) {
        this.categories = categories; this.users = users; this.expenses = expenses; this.budgets = budgets;
    }

    public List<CategoryDtos.CategoryResponse> list(String email) {
        User user = userFor(email);
        ensureDefaults(user);
        return categories.findByUserIdOrderByNameAsc(user.getId()).stream()
                .map(category -> CategoryDtos.CategoryResponse.from(category, DEFAULTS.containsKey(category.getName())))
                .toList();
    }
    public CategoryDtos.CategoryResponse create(String email, CategoryDtos.CategoryRequest request) {
        User user = userFor(email);
        ensureDefaults(user);
        String name = request.name().trim();
        ensureUniqueName(user.getId(), name, null);
        Category saved = categories.save(new Category(name, request.color().toUpperCase(Locale.ROOT), user));
        return CategoryDtos.CategoryResponse.from(saved, DEFAULTS.containsKey(saved.getName()));
    }
    public CategoryDtos.CategoryResponse update(String email, Long id, CategoryDtos.CategoryRequest request) {
        User user = userFor(email);
        Category category = ownedCategory(id, user.getId());
        String name = request.name().trim();
        ensureUniqueName(user.getId(), name, id);
        category.update(name, request.color().toUpperCase(Locale.ROOT));
        return CategoryDtos.CategoryResponse.from(category, DEFAULTS.containsKey(category.getName()));
    }
    public void delete(String email, Long id) {
        User user = userFor(email);
        Category category = ownedCategory(id, user.getId());
        if (expenses.countByCategoryId(id) > 0 || budgets.countByCategoryId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This category is used by expenses or budgets");
        }
        categories.delete(category);
    }
    private void ensureDefaults(User user) {
        if (!categories.findByUserIdOrderByNameAsc(user.getId()).isEmpty()) return;
        DEFAULTS.forEach((name, color) -> categories.findByUserIdAndNameIgnoreCase(user.getId(), name)
                .orElseGet(() -> categories.save(new Category(name, color, user))));
    }
    private void ensureUniqueName(Long userId, String name, Long currentId) {
        categories.findByUserIdAndNameIgnoreCase(userId, name).filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists"); });
    }
    private User userFor(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
    private Category ownedCategory(Long id, Long userId) {
        return categories.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }
}
