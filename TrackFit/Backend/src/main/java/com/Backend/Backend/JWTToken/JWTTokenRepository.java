package com.Backend.Backend.JWTToken;


import com.Backend.Backend.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JWTTokenRepository extends JpaRepository<JWTToken, Long> {
    boolean existsByUsername(String username);
    JWTToken findByUsername(String username);
}
