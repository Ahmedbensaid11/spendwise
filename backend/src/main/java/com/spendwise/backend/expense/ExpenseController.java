package com.spendwise.backend.expense;

import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService service;
    public ExpenseController(ExpenseService service) { this.service = service; }

    @GetMapping
    public List<ExpenseDtos.ExpenseResponse> list(Authentication authentication,
            @RequestParam(required = false) String search, @RequestParam(required = false) String category,
            @RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "date") String sort, @RequestParam(defaultValue = "desc") String direction) {
        if (!sort.equalsIgnoreCase("date") && !sort.equalsIgnoreCase("amount")) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Sort must be date or amount");
        }
        return service.list(authentication.getName(), search, category, from, to, sort, direction);
    }
    @PostMapping
    public ResponseEntity<ExpenseDtos.ExpenseResponse> create(Authentication authentication,
            @Valid @RequestBody ExpenseDtos.ExpenseRequest request) {
        var created = service.create(authentication.getName(), request);
        return ResponseEntity.created(URI.create("/api/expenses/" + created.id())).body(created);
    }
    @GetMapping("/{id}")
    public ExpenseDtos.ExpenseResponse get(Authentication authentication, @PathVariable Long id) {
        return service.get(authentication.getName(), id);
    }
    @PutMapping("/{id}")
    public ExpenseDtos.ExpenseResponse update(Authentication authentication, @PathVariable Long id,
            @Valid @RequestBody ExpenseDtos.ExpenseRequest request) {
        return service.update(authentication.getName(), id, request);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        service.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
