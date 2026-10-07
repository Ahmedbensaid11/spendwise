package com.spendwise.backend.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class CategoryDtos {
    private CategoryDtos() {}
    public record CategoryRequest(@NotBlank @Size(max = 60) String name,
                                  @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a six-digit hex value") String color) {}
    public record CategoryResponse(Long id, String name, String color, boolean defaultCategory) {
        static CategoryResponse from(Category category, boolean defaultCategory) {
            return new CategoryResponse(category.getId(), category.getName(), category.getColor(), defaultCategory);
        }
    }
}
