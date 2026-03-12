package com.deepika.AuraDrive.controller;

import com.deepika.AuraDrive.dto.PaymentRequestDTO;
import com.deepika.AuraDrive.dto.PaymentResponseDTO;
import com.deepika.AuraDrive.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // 1. Create a Payment Intent (Called when the user clicks "Pay")
    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody PaymentRequestDTO requestDTO) {
        try {
            // Generate the secret from Stripe via the Service
            String clientSecret = paymentService.createPaymentIntent(requestDTO);
            return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Confirm Payment Status (Called after Stripe confirms on Frontend)
    @PostMapping("/confirm/{paymentIntentId}")
    public ResponseEntity<Void> confirmPayment(@PathVariable String paymentIntentId) {
        paymentService.updatePaymentStatus(paymentIntentId, "COMPLETED");
        return ResponseEntity.ok().build();
    }
}