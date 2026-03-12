package com.deepika.AuraDrive.entity.constant;

public enum RideStatus {
    REQUESTED,   // Rider has asked for a ride
    ACCEPTED,    // Driver is on the way to pickup
    ARRIVED,     // Driver has reached the pickup point
    ONGOING,     // Trip is currently in progress
    COMPLETED,   // Trip finished successfully
    CANCELLED    // Trip was aborted by Rider/Driver
}