package com.deepika.AuraDrive.repository;

import com.deepika.AuraDrive.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Fetch all comments for a specific task/ride drawer
    List<Comment> findByRideIdOrderByCreatedAtAsc(Long rideId);
}