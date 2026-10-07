package com.spendwise.backend.budget;

import jakarta.validation.Valid;
import java.net.URI;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService service;
    public BudgetController(BudgetService service) { this.service = service; }
    @GetMapping public List<BudgetDtos.BudgetResponse> list(Authentication auth,
            @RequestParam(required = false) Integer year, @RequestParam(required = false) Integer month) {
        YearMonth period = YearMonth.now();
        return service.list(auth.getName(), year == null ? period.getYear() : year, month == null ? period.getMonthValue() : month);
    }
    @PostMapping public ResponseEntity<BudgetDtos.BudgetResponse> create(Authentication auth,
            @Valid @RequestBody BudgetDtos.BudgetRequest request) {
        var budget = service.create(auth.getName(), request);
        return ResponseEntity.created(URI.create("/api/budgets/" + budget.id())).body(budget);
    }
    @PutMapping("/{id}") public BudgetDtos.BudgetResponse update(Authentication auth, @PathVariable Long id,
            @Valid @RequestBody BudgetDtos.BudgetRequest request) { return service.update(auth.getName(), id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        service.delete(auth.getName(), id); return ResponseEntity.noContent().build();
    }
}
