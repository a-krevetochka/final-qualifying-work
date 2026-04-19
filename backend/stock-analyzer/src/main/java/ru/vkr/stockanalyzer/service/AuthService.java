package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.dto.auth.AuthRequest;
import ru.vkr.stockanalyzer.dto.auth.AuthResponse;
import ru.vkr.stockanalyzer.dto.auth.RegisterRequest;
import ru.vkr.stockanalyzer.entity.User;
import ru.vkr.stockanalyzer.exception.EmailAlreadyExistsException;
import ru.vkr.stockanalyzer.repository.UserRepository;
import ru.vkr.stockanalyzer.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JwtService          jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email уже используется");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user  = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Пользователь не найден"));
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public AuthResponse me(String token) {
        String email = jwtService.extractUsername(token);
        User user    = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Пользователь не найден"));

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }
}