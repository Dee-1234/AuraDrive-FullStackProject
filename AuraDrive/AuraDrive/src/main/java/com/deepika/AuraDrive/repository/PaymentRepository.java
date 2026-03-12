package com.deepika.AuraDrive.repository;

import com.deepika.AuraDrive.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment details for a specific ride to generate a receipt
    Optional<Payment> findByRideId(Long rideId);

    // Find a payment by the Stripe Intent ID (useful for Webhooks)
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
}