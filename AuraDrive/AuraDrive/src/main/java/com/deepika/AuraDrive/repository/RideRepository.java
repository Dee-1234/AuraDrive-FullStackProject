package com.deepika.AuraDrive.repository;

import com.deepika.AuraDrive.entity.Ride;
import com.deepika.AuraDrive.entity.constant.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    // Find all rides for a specific rider (history)
    List<Ride> findByRiderIdOrderByCreatedAtDesc(Long riderId);

    // Find active rides for a driver
    List<Ride> findByStatus(RideStatus status);
    List<Ride> findByUserEmail(String email);
    List<Ride> findByRiderEmailOrDriverUserEmail(String riderEmail, String driverEmail);

    @Query("SELECT r FROM Ride r WHERE r.status = com.deepika.AuraDrive.entity.constant.RideStatus.REQUESTED")
    List<Ride> findAvailableRides();
}