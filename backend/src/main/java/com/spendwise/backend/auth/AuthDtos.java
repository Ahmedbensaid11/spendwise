package com.spendwise.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(@NotBlank @Size(max = 120) String name,
                                  @NotBlank @Email @Size(max = 254) String email,
                                  @NotBlank @Size(min = 8, max = 72) String password,
                                  @NotBlank @Size(max = 72) String passwordConfirmation) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record ProfileUpdateRequest(@NotBlank @Size(max = 120) String name,
                                      @NotBlank @Email @Size(max = 254) String email) {}
    public record PasswordChangeRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min = 8, max = 72) String newPassword,
                                        @NotBlank @Size(max = 72) String passwordConfirmation) {}
    public record UserResponse(Long id, String name, String email) {}
    public record AuthResponse(String token, UserResponse user) {}
}
