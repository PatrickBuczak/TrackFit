package com.Backend.Backend.JWTToken;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;


@Entity
@Table
public class JWTToken {
    @Id
    @SequenceGenerator(
            name="jwttoken_sequence",
            sequenceName="jwttoken_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "jwttoken_sequence"
    )
    private Long id;
    private String username;
    private String token;
    private LocalDateTime expirationTime;
    private LocalDateTime createdAt;


    public JWTToken() {
    }

    public JWTToken(Long id, LocalDateTime createdAt, LocalDateTime expirationTime, String token, String username) {
        this.id = id;
        this.createdAt = createdAt;
        this.expirationTime = expirationTime;
        this.token = token;
        this.username = username;
    }

    public JWTToken(String username, String token, LocalDateTime createdAt, LocalDateTime expirationTime) {
        this.username = username;
        this.token = token;
        this.createdAt = createdAt;
        this.expirationTime = expirationTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(LocalDateTime expirationTime) {
        this.expirationTime = expirationTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "JWTToken{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", token='" + token + '\'' +
                ", expirationTime=" + expirationTime +
                ", createdAt=" + createdAt +
                '}';
    }
}
