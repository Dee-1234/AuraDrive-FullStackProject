package com.deepika.AuraDrive.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private String paymentIntentId;
    private String status;
    private Double amount;
}