package com.deepika.AuraDrive.service;

import com.deepika.AuraDrive.dto.PaymentRequestDTO;
import com.deepika.AuraDrive.entity.Payment;
import com.deepika.AuraDrive.entity.Ride;
import com.deepika.AuraDrive.entity.constant.PaymentStatus;
import com.deepika.AuraDrive.repository.PaymentRepository;
import com.deepika.AuraDrive.repository.RideRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor // Automatically injects repositories
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createPaymentIntent(PaymentRequestDTO requestDTO) throws StripeException {
        // 1. Create the Stripe Intent
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (requestDTO.getAmount() * 100)) // amount in paise
                .setCurrency("inr")
                .putMetadata("ride_id", requestDTO.getRideId().toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        // 2. Save a PENDING payment record in our DB
        Ride ride = rideRepository.findById(requestDTO.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Payment payment = Payment.builder()
                .ride(ride)
                .amount(requestDTO.getAmount())
                .currency("INR")
                .stripePaymentIntentId(intent.getId())
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        return intent.getClientSecret();
    }

    public void updatePaymentStatus(String paymentIntentId, String status) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.valueOf(status));
        paymentRepository.save(payment);
    }
}