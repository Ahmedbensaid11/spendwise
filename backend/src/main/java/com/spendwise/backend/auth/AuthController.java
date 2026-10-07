package com.spendwise.backend.auth;

import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;
    public AuthController(AuthService auth, UserRepository users) { this.auth = auth; this.users = users; }
    @PostMapping("/register") public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) { return auth.register(request); }
    @PostMapping("/login") public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) { return auth.login(request); }
    @GetMapping("/me") public AuthDtos.UserResponse me(Authentication authentication) {
        User user = users.findByEmail(authentication.getName()).orElseThrow();
        return new AuthDtos.UserResponse(user.getId(), user.getName(), user.getEmail());
    }
    @PutMapping("/me/profile") public AuthDtos.AuthResponse updateProfile(Authentication authentication,
            @Valid @RequestBody AuthDtos.ProfileUpdateRequest request) {
        return auth.updateProfile(authentication.getName(), request);
    }
    @PutMapping("/me/password") public void changePassword(Authentication authentication,
            @Valid @RequestBody AuthDtos.PasswordChangeRequest request) {
        auth.changePassword(authentication.getName(), request);
    }
}
