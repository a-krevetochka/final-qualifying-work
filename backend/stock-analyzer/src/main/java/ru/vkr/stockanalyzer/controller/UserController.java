package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.user.UpdatePasswordDto;
import ru.vkr.stockanalyzer.dto.user.UpdateProfileDto;
import ru.vkr.stockanalyzer.dto.user.UserProfileDto;
import ru.vkr.stockanalyzer.service.UserService;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestBody UpdateProfileDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.updateProfile(request, userDetails));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @RequestBody UpdatePasswordDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.updatePassword(request, userDetails);
        return ResponseEntity.noContent().build();
    }
}