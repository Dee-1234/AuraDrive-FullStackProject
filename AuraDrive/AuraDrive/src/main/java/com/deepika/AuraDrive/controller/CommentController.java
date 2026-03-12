package com.deepika.AuraDrive.controller;

import com.deepika.AuraDrive.dto.CommentResponseDTO;
import com.deepika.AuraDrive.entity.User;
import com.deepika.AuraDrive.repository.UserRepository;
import com.deepika.AuraDrive.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @PostMapping("/ride/{rideId}")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long rideId,
            @RequestBody Map<String, String> request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        String content = request.get("content");
        return ResponseEntity.ok(commentService.addComment(rideId, content, user));
    }
}