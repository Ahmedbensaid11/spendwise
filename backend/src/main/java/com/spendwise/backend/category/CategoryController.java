package com.spendwise.backend.category;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;
    public CategoryController(CategoryService service) { this.service = service; }
    @GetMapping public List<CategoryDtos.CategoryResponse> list(Authentication auth) { return service.list(auth.getName()); }
    @PostMapping public ResponseEntity<CategoryDtos.CategoryResponse> create(Authentication auth, @Valid @RequestBody CategoryDtos.CategoryRequest request) {
        var category = service.create(auth.getName(), request);
        return ResponseEntity.created(URI.create("/api/categories/" + category.id())).body(category);
    }
    @PutMapping("/{id}") public CategoryDtos.CategoryResponse update(Authentication auth, @PathVariable Long id,
            @Valid @RequestBody CategoryDtos.CategoryRequest request) { return service.update(auth.getName(), id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        service.delete(auth.getName(), id); return ResponseEntity.noContent().build();
    }
}
