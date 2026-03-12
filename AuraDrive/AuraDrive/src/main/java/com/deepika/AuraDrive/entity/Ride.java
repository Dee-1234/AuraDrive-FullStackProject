package com.deepika.AuraDrive.entity;

import com.deepika.AuraDrive.entity.constant.RideStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ride extends BaseEntity{ // Extends auditing fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    private String pickupLocation;
    private String destination;

    @Enumerated(EnumType.STRING)
    private RideStatus status; // REQUESTED, ACCEPTED, ONGOING, COMPLETED, CANCELLED

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    private Double distance;
    private Double fare;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @ManyToOne
    private User user;

    @OneToOne(mappedBy = "ride", cascade = CascadeType.ALL)
    private Payment payment;
}