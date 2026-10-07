package com.spendwise.backend.budget;

import com.spendwise.backend.category.Category;
import com.spendwise.backend.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "budgets", indexes = @Index(name = "idx_budget_user_period", columnList = "user_id, budget_year, budget_month"))
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amount;
    @Column(name = "budget_month", nullable = false)
    private int month;
    @Column(name = "budget_year", nullable = false)
    private int year;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Budget() {}
    public Budget(BigDecimal amount, int month, int year, Category category, User user) {
        this.amount = amount; this.month = month; this.year = year; this.category = category; this.user = user;
    }
    public void update(BigDecimal amount, int month, int year, Category category) {
        this.amount = amount; this.month = month; this.year = year; this.category = category;
    }
    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public int getMonth() { return month; }
    public int getYear() { return year; }
    public Category getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
}
