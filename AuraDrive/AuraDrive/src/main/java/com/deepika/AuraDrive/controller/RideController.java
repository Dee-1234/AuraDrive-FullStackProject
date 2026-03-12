package com.deepika.AuraDrive.controller;

import com.deepika.AuraDrive.dto.*;
import com.deepika.AuraDrive.entity.Payment;
import com.deepika.AuraDrive.entity.Ride;
import com.deepika.AuraDrive.entity.constant.RideStatus;
import com.deepika.AuraDrive.repository.PaymentRepository;
import com.deepika.AuraDrive.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final PaymentRepository paymentRepository;

    /**
     * MARKETPLACE LOGIC: Get all rides currently in REQUESTED state.
     * This is what drivers will see on their dashboard.
     */
    /*@GetMapping("/available")
    @PreAuthorize("hasAuthority('DRIVER')")
    public ResponseEntity<List<RideResponseDTO>> getAvailableRides() {
        // Service should call rideRepository.findByStatus(RideStatus.REQUESTED)
        return ResponseEntity.ok(rideService.getAvailableRides());
    }*/

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('ROLE_DRIVER') or hasAuthority('DRIVER')")
    public ResponseEntity<List<RideResponseDTO>> getAvailableRides() {
        return ResponseEntity.ok(rideService.getAvailableRides());
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RideResponseDTO> requestRide(@Valid @RequestBody RideRequestDTO requestDTO, Principal principal) {
        return ResponseEntity.ok(rideService.createRide(requestDTO, principal.getName()));
    }

    /**
     * CLAIM LOGIC: Driver clicks "Accept".
     * Note: The service layer should handle the check to ensure status is still REQUESTED.
     */
    @PutMapping("/{rideId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> acceptRide(@PathVariable Long rideId, Principal principal) {
        try {
            RideResponseDTO response = rideService.acceptRideByEmail(rideId, principal.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // Handle case where another driver accepted it first
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PatchMapping("/{rideId}/status")
    public ResponseEntity<RideResponseDTO> updateStatus(
            @PathVariable Long rideId,
            @RequestBody UpdateStatusDTO statusDTO,
            Principal principal) {

        rideService.validateRideParticipant(rideId, principal.getName());

        if (statusDTO.getStatus() == RideStatus.COMPLETED) {
            return ResponseEntity.ok(rideService.completeRide(rideId));
        }

        rideService.updateRideStatus(rideId, statusDTO.getStatus());
        return ResponseEntity.ok(rideService.mapToResponseDTO(rideService.getRideById(rideId)));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<RideResponseDTO>> getMyRides(Principal principal) {
        return ResponseEntity.ok(rideService.getRidesByUserEmail(principal.getName()));
    }

    @GetMapping("/{rideId}/receipt")
    public ResponseEntity<Map<String, Object>> getReceipt(@PathVariable Long rideId, Principal principal) {
        rideService.validateRideParticipant(rideId, principal.getName());

        Ride ride = rideService.getRideById(rideId);
        Payment payment = paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new RuntimeException("Payment record not found."));

        return ResponseEntity.ok(Map.of("ride", ride, "payment", payment));
    }

    @PutMapping("/{rideId}")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RideResponseDTO> updateRide(
            @PathVariable Long rideId,
            @Valid @RequestBody RideRequestDTO requestDTO,
            Principal principal) {

        rideService.validateRiderOwnership(rideId, principal.getName());
        return ResponseEntity.ok(rideService.updateRide(rideId, requestDTO));
    }

    @PutMapping("/{rideId}/start")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideResponseDTO> startRide(@PathVariable Long rideId, Principal principal) {
        return ResponseEntity.ok(rideService.startRide(rideId, principal.getName()));
    }

    @PutMapping("/{rideId}/complete")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideResponseDTO> completeRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(rideService.completeRide(rideId));
    }
}