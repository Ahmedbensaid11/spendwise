package com.spendwise.backend.auth;

import com.spendwise.backend.user.User;
import com.spendwise.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    public AuthService(UserRepository users, PasswordEncoder passwords, JwtService jwt) {
        this.users = users; this.passwords = passwords; this.jwt = jwt;
    }
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!request.password().equals(request.passwordConfirmation()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        if (users.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        User user = users.save(new User(request.name().trim(), email, passwords.encode(request.password())));
        return response(user);
    }
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = users.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
                .filter(candidate -> passwords.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return response(user);
    }
    public AuthDtos.AuthResponse updateProfile(String email, AuthDtos.ProfileUpdateRequest request) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        String updatedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailAndIdNot(updatedEmail, user.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        user.updateProfile(request.name().trim(), updatedEmail);
        users.save(user);
        return response(user);
    }
    public void changePassword(String email, AuthDtos.PasswordChangeRequest request) {
        if (!request.newPassword().equals(request.passwordConfirmation()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New passwords do not match");
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!passwords.matches(request.currentPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        user.updatePasswordHash(passwords.encode(request.newPassword()));
        users.save(user);
    }
    private AuthDtos.AuthResponse response(User user) {
        return new AuthDtos.AuthResponse(jwt.generate(user), new AuthDtos.UserResponse(user.getId(), user.getName(), user.getEmail()));
    }
}
