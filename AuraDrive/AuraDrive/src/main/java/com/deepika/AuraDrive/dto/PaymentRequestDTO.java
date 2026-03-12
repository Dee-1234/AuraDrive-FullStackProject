package com.deepika.AuraDrive.dto;

import lombok.Data;

@Data
public class PaymentRequestDTO {
    private Long rideId;
    private Double amount;
}