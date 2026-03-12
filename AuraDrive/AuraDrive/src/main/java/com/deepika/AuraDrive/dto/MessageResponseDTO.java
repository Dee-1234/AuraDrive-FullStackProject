package com.deepika.AuraDrive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor // This is the missing piece!
@NoArgsConstructor  // Good practice for JSON deserialization
public class MessageResponseDTO {
    private String message;
}