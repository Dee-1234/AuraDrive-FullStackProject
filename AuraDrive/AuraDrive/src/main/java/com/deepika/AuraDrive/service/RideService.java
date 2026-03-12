package com.deepika.AuraDrive.service;

import com.deepika.AuraDrive.dto.*;
import com.deepika.AuraDrive.entity.*;
import com.deepika.AuraDrive.entity.constant.*;
import com.deepika.AuraDrive.exception.ResourceNotFoundException;
import com.deepika.AuraDrive.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.modelmapper.ModelMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PaymentRepository paymentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ModelMapper modelMapper;

    /**
     * NEW: Marketplace Query
     * Fetches all rides that are currently 'REQUESTED' and haven't been picked up.
     */
    public List<RideResponseDTO> getAvailableRides() {
       return rideRepository.findByStatus(RideStatus.REQUESTED)
               .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    /*public List<RideResponseDTO> getAvailableRides() {
        List<Ride> rides = rideRepository.findByStatus(RideStatus.REQUESTED);

        return rides.stream().map(ride -> {
            RideResponseDTO dto = new RideResponseDTO();
            dto.setId(ride.getId());
            dto.setPickupLocation(ride.getPickupLocation());
            dto.setDestination(ride.getDestination());
            dto.setFare(ride.getFare());
            dto.setRiderName(ride.getRider().getName()); // Or however your User entity is structured
            return dto;
        }).collect(Collectors.toList());
    }*/

    @Transactional
    public RideResponseDTO createRide(RideRequestDTO requestDTO, String riderEmail) {
        User rider = userRepository.findByEmail(riderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Ride ride = new Ride();
        ride.setRider(rider);
        ride.setPickupLocation(requestDTO.getPickupLocation());
        ride.setDestination(requestDTO.getDestination());
        ride.setDistance(requestDTO.getDistance());
        ride.setFare(requestDTO.getFare());
        ride.setStatus(RideStatus.REQUESTED);

        Ride savedRide = rideRepository.save(ride);

        RideResponseDTO responseDTO = mapToResponseDTO(savedRide);
        messagingTemplate.convertAndSend("/topic/available-rides", responseDTO);

        return responseDTO;
    }

    @Transactional
    public RideResponseDTO acceptRideByEmail(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        // ATOMIC CHECK: Ensure no other driver accepted this ride while this driver was looking at it
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new IllegalStateException("This ride has already been accepted by another driver.");
        }

        Driver driver = driverRepository.findByUserEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for: " + driverEmail));

        if (!driver.isAvailable()) {
            throw new IllegalStateException("Driver is currently unavailable or on another ride.");
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.ACCEPTED);
        ride.setStartTime(LocalDateTime.now());

        driver.setAvailable(false);
        driverRepository.save(driver);

        return mapToResponseDTO(rideRepository.save(ride), driverEmail);
    }

    @Transactional
    public RideResponseDTO startRide(Long rideId, String driverEmail) {
        validateDriverOwnership(rideId, driverEmail);
        Ride ride = getRideById(rideId);

        if (ride.getStatus() != RideStatus.ACCEPTED) {
            throw new IllegalStateException("Ride must be ACCEPTED before starting.");
        }

        ride.setStatus(RideStatus.ONGOING);
        ride.setStartTime(LocalDateTime.now());
        return mapToResponseDTO(rideRepository.save(ride), driverEmail);
    }

    @Transactional
    public RideResponseDTO completeRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());

        Payment payment = Payment.builder()
                .ride(ride)
                .amount(ride.getFare())
                .currency("INR")
                .status(PaymentStatus.COMPLETED)
                .build();

        paymentRepository.save(payment);

        if (ride.getDriver() != null) {
            Driver driver = ride.getDriver();
            driver.setAvailable(true);
            driverRepository.save(driver);
        }

        return mapToResponseDTO(rideRepository.save(ride));
    }

    @Transactional
    public void updateRideStatus(Long rideId, RideStatus status) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        ride.setStatus(status);

        if ((status == RideStatus.CANCELLED || status == RideStatus.COMPLETED) && ride.getDriver() != null) {
            Driver driver = ride.getDriver();
            driver.setAvailable(true);
            driverRepository.save(driver);
        }

        rideRepository.save(ride);
    }

    @Transactional
    public RideResponseDTO updateRide(Long rideId, RideRequestDTO requestDTO) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new IllegalStateException("Cannot update a ride that is already " + ride.getStatus());
        }

        ride.setPickupLocation(requestDTO.getPickupLocation());
        ride.setDestination(requestDTO.getDestination());
        ride.setFare(requestDTO.getFare());
        ride.setDistance(requestDTO.getDistance());

        return mapToResponseDTO(rideRepository.save(ride));
    }

    // --- Validations ---

    public void validateRideParticipant(Long rideId, String email) {
        Ride ride = getRideById(rideId);
        boolean isRider = ride.getRider().getEmail().equals(email);
        boolean isDriver = ride.getDriver() != null && ride.getDriver().getUser().getEmail().equals(email);

        if (!isRider && !isDriver) {
            throw new IllegalStateException("Access Denied: You are not a participant in this ride.");
        }
    }

    public void validateRiderOwnership(Long rideId, String email) {
        Ride ride = getRideById(rideId);
        if (!ride.getRider().getEmail().equals(email)) {
            throw new IllegalStateException("Access Denied: You are not the owner of this ride request.");
        }
    }

    // --- Queries & Mapping ---

    public List<RideResponseDTO> getRidesByUserEmail(String email) {
        return rideRepository.findByRiderEmailOrDriverUserEmail(email, email)
                .stream()
                .map(ride -> mapToResponseDTO(ride, email))
                .collect(Collectors.toList());
    }

    public Ride getRideById(Long id) {
        return rideRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
    }

    public RideResponseDTO mapToResponseDTO(Ride ride, String currentUserEmail) {
        String role = "VIEWER";
        if (ride.getRider() != null && ride.getRider().getEmail().equals(currentUserEmail)) {
            role = "RIDER";
        } else if (ride.getDriver() != null && ride.getDriver().getUser().getEmail().equals(currentUserEmail)) {
            role = "DRIVER";
        }
        RideResponseDTO dto = mapToResponseDTO(ride);
        dto.setUserRole(role);
        return dto;
    }

    public RideResponseDTO mapToResponseDTO(Ride ride) {
        return RideResponseDTO.builder()
                .id(ride.getId())
                .pickupLocation(ride.getPickupLocation())
                .destination(ride.getDestination())
                .fare(ride.getFare())
                .distance(ride.getDistance())
                .status(ride.getStatus())
                .createdAt(ride.getCreatedAt())
                // MAP THE NEW FIELDS HERE
                .startTime(ride.getStartTime())
                .endTime(ride.getEndTime())
                .riderName(ride.getRider() != null ? ride.getRider().getName() : "Unknown")
                .driverName(ride.getDriver() != null && ride.getDriver().getUser() != null
                        ? ride.getDriver().getUser().getName() : "Searching...")
                .comments(ride.getComments() != null ? ride.getComments().stream()
                        .map(c -> new CommentResponseDTO(c.getId(), c.getContent(), c.getUser().getName(), c.getCreatedAt()))
                        .collect(Collectors.toList()) : List.of())
                .build();
    }

    public void validateDriverOwnership(Long rideId, String email) {
        Ride ride = getRideById(rideId);
        if (ride.getDriver() == null || !ride.getDriver().getUser().getEmail().equals(email)) {
            throw new IllegalStateException("Access Denied: You are not the driver assigned to this ride.");
        }
    }
}