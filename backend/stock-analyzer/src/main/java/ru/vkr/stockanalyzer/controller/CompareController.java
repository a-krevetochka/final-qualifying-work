package ru.vkr.stockanalyzer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.vkr.stockanalyzer.dto.compare.CompareRequestDto;
import ru.vkr.stockanalyzer.dto.compare.CompareResultDto;
import ru.vkr.stockanalyzer.service.CompareService;

import java.util.List;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
public class CompareController {

    private final CompareService compareService;

    @PostMapping
    public ResponseEntity<CompareResultDto> compare(
            @RequestBody CompareRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(compareService.compare(request, userDetails));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CompareResultDto>> history(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(compareService.getHistory(userDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        compareService.delete(id, userDetails);
        return ResponseEntity.noContent().build();
    }
}