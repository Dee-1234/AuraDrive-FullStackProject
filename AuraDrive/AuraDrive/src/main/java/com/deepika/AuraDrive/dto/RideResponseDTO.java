package com.deepika.AuraDrive.dto;

import com.deepika.AuraDrive.entity.constant.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RideResponseDTO {
    private Long id;
    private String pickupLocation;
    private String destination;
    private Double fare;
    private Double distance;
    private RideStatus status;
    private LocalDateTime createdAt;

    // Crucial for the "Started" and "Completed" phases
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String riderName;
    private String driverName;
    private String userRole; // RIDER or DRIVER
    private List<CommentResponseDTO> comments;
}