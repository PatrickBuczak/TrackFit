package com.Backend.Backend.JWTToken;


import com.Backend.Backend.User.User;
import com.Backend.Backend.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
public class JWTTokenService {

    private final JWTTokenRepository jwtTokenRepository;

    @Autowired
    public JWTTokenService(JWTTokenRepository jwtTokenRepository) {
        this.jwtTokenRepository = jwtTokenRepository;
    }


    public List<JWTToken> getTokens(){
        return jwtTokenRepository.findAll();
    }

    public JWTToken generateAndSaveToken(String username) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(15);
        JWTToken jwtToken = new JWTToken();
        jwtToken.setUsername(username);
        jwtToken.setToken(token);
        jwtToken.setExpirationTime(expirationTime);
        jwtToken.setCreatedAt(LocalDateTime.now());
        return jwtTokenRepository.save(jwtToken);
    }

    public boolean checkIfJWTTokenExists(String username) {
        return jwtTokenRepository.existsByUsername(username);
    }

    @Scheduled(fixedRate = 1000) // Überprüft jede 1 Sekunde beim laufen des Backends automatisiert
    public void deleteExpiredTokens() {
        List<JWTToken> tokens = jwtTokenRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (JWTToken token : tokens) {
            if (token.getExpirationTime().isBefore(now)) {
                jwtTokenRepository.delete(token);
            }
        }
    }

    public void deleteTokenByUsername(String username) {
        JWTToken token = jwtTokenRepository.findByUsername(username);
        if (token != null) {
            jwtTokenRepository.delete(token);
        }
    }


}
