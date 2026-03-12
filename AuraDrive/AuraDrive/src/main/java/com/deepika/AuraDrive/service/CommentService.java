package com.deepika.AuraDrive.service;

import com.deepika.AuraDrive.dto.CommentResponseDTO;
import com.deepika.AuraDrive.entity.Comment;
import com.deepika.AuraDrive.entity.Ride;
import com.deepika.AuraDrive.entity.User;
import com.deepika.AuraDrive.exception.ResourceNotFoundException;
import com.deepika.AuraDrive.repository.CommentRepository;
import com.deepika.AuraDrive.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final RideRepository rideRepository;
    private final ModelMapper modelMapper;

    public CommentResponseDTO addComment(Long rideId, String content, User user) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        // Basic Stability Check: Is this user part of the ride?
        if (!ride.getRider().equals(user) && !ride.getDriver().getUser().equals(user)) {
            throw new AccessDeniedException("You are not authorized to comment on this ride.");
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setRide(ride);
        comment.setUser(user);

        return modelMapper.map(commentRepository.save(comment), CommentResponseDTO.class);
    }
}
