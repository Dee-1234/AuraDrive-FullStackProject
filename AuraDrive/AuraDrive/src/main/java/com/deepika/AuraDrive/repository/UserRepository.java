package com.deepika.AuraDrive.repository;

import com.deepika.AuraDrive.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Crucial for JWT Authentication: Finding the user by their login email
    Optional<User> findByEmail(String email);

    // Stability Check: Useful for registration to prevent duplicate accounts
    Boolean existsByEmail(String email);
}