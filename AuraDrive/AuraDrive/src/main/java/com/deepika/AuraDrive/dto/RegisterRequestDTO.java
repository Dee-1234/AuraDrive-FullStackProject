package com.deepika.AuraDrive.dto;

import com.deepika.AuraDrive.entity.constant.UserRole;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    private String name;
    private String email;
    private String password;
    private UserRole role;
}