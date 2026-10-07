package com.spendwise.backend.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(nullable = false, unique = true, length = 254)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected User() {}
    public User(String name, String email, String passwordHash) {
        this.name = name; this.email = email; this.passwordHash = passwordHash;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Instant getCreatedAt() { return createdAt; }
    public void updateName(String name) { this.name = name; }
    public void updateProfile(String name, String email) { this.name = name; this.email = email; }
    public void updatePasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
