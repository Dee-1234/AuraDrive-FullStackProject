package com.deepika.AuraDrive.service;

import com.deepika.AuraDrive.dto.AuthResponseDTO;
import com.deepika.AuraDrive.dto.LoginRequestDTO;
import com.deepika.AuraDrive.dto.MessageResponseDTO;
import com.deepika.AuraDrive.dto.RegisterRequestDTO;
import com.deepika.AuraDrive.entity.Driver;
import com.deepika.AuraDrive.entity.User;
import com.deepika.AuraDrive.entity.constant.UserRole;
import com.deepika.AuraDrive.repository.DriverRepository;
import com.deepika.AuraDrive.repository.UserRepository;
import com.deepika.AuraDrive.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final DriverRepository driverRepository;

//    public AuthResponseDTO register(RegisterRequestDTO request) {
//        var user = User.builder()
//                .name(request.getName())
//                .email(request.getEmail())
//                .password(passwordEncoder.encode(request.getPassword()))
//                .role(request.getRole())
//                .enabled(true)
//                .build();
//        userRepository.save(user);
//        var jwtToken = jwtService.generateToken(user);
//        return AuthResponseDTO.builder().token(jwtToken).build();
//    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Add extra claims to the JWT (like role) so the frontend can read it without a second API call
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());

        var jwtToken = jwtService.generateToken(extraClaims, user);

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .role(user.getRole().name()) // Include role in response for React redirection
                .build();
    }
    @Transactional // Ensures both User and Driver are saved or neither is
    public MessageResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // 1. Create the Base User
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole()) // This maps to your UserRole Enum
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Specialized Logic: If registering as a Driver, initialize Driver entity
        if (UserRole.DRIVER.equals(request.getRole())) {
            var driver = Driver.builder()
                    .user(savedUser)
                    .licenseNumber("PENDING") // Placeholder until profile update
                    .vehicleModel("PENDING")
                    .vehiclePlate("PENDING")
                    .isAvailable(true)
                    .rating(5.0)
                    .build();
            driverRepository.save(driver);
        }

        return new MessageResponseDTO("User registered successfully! Please log in to continue.");
    }
}