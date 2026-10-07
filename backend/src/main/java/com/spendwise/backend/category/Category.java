package com.spendwise.backend.category;

import com.spendwise.backend.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 60)
    private String name;
    @Column(nullable = false, length = 7)
    private String color;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected Category() {}
    public Category(String name, String color, User user) { this.name = name; this.color = color; this.user = user; }
    public void update(String name, String color) { this.name = name; this.color = color; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
}
