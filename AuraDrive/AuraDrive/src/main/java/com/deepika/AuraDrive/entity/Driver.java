package com.deepika.AuraDrive.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drivers")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the base User record (Email, Password, Name)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String vehicleModel;

    @Column(nullable = false)
    private String vehiclePlate;

    // Stability Check: Is the driver currently taking rides?
    private boolean isAvailable = true;

    private Double rating = 5.0;

    // Real-time tracking fields (to be updated via WebSockets)
    private Double currentLatitude;
    private Double currentLongitude;
}