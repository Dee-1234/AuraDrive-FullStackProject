package com.deepika.AuraDrive.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class RideRequestDTO {
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Distance cannot be null")
    private Double distance;

    @NotNull(message = "Fare cannot be null")
    private Double fare;
}