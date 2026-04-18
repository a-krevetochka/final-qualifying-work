package ru.vkr.stockanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.vkr.stockanalyzer.dto.user.UpdatePasswordDto;
import ru.vkr.stockanalyzer.dto.user.UpdateProfileDto;
import ru.vkr.stockanalyzer.dto.user.UserProfileDto;
import ru.vkr.stockanalyzer.entity.User;
import ru.vkr.stockanalyzer.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto getProfile(UserDetails userDetails) {
        User user = getUser(userDetails);
        return toDto(user);
    }

    public UserProfileDto updateProfile(UpdateProfileDto request, UserDetails userDetails) {
        User user = getUser(userDetails);
        user.setUsername(request.getUsername());
        userRepository.save(user);
        return toDto(user);
    }

    public void updatePassword(UpdatePasswordDto request, UserDetails userDetails) {
        User user = getUser(userDetails);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Неверный текущий пароль");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    private UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .createdAt(user.getCreatedAt())
                .build();
    }
}