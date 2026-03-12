package com.deepika.AuraDrive.repository;

import com.deepika.AuraDrive.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Used during Login/Auth to find the driver profile for a user
    Optional<Driver> findByUserId(Long userId);

    // Find all drivers currently marked as 'Available'
    List<Driver> findByIsAvailableTrue();

    Optional<Driver> findByUserEmail(String email);

    /**
     * Advanced: Finding drivers near a specific location.
     * This uses the Haversine formula logic we discussed!
     */
    @Query(value = "SELECT * FROM drivers d WHERE d.is_available = true " +
            "AND (6371 * acos(cos(radians(:lat)) * cos(radians(d.current_latitude)) * " +
            "cos(radians(d.current_longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(d.current_latitude)))) < :distance", nativeQuery = true)
    List<Driver> findNearbyAvailableDrivers(@Param("lat") Double lat,
                                            @Param("lng") Double lng,
                                            @Param("distance") Double distance);
}