package com.spendwise.backend.expense;

import com.spendwise.backend.user.User;
import com.spendwise.backend.category.Category;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expense_user_date", columnList = "user_id, expense_date")
})
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amount;
    @Column(nullable = false, length = 200)
    private String description;
    @Column(name = "expense_date", nullable = false)
    private LocalDate date;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Expense() {}
    public Expense(BigDecimal amount, String description, LocalDate date, Category category, User user) {
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = category;
        this.user = user;
    }
    public void update(BigDecimal amount, String description, LocalDate date, Category category) {
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = category;
    }
    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public String getDescription() { return description; }
    public LocalDate getDate() { return date; }
    public Category getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
}
