package com.Backend.Backend.JWTToken;

import com.Backend.Backend.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/jwttoken")
public class JWTTokenController {
    private final JWTTokenService jwtTokenService;
    private final JWTTokenRepository jwtTokenRepository;
    private final UserService userService; // UserService für die Standardisierung

    @Autowired
    public JWTTokenController(JWTTokenService jwtTokenService, JWTTokenRepository jwtTokenRepository, UserService userService) {
        this.jwtTokenRepository = jwtTokenRepository;
        this.jwtTokenService = jwtTokenService;
        this.userService = userService; // Initialisierung des UserService
    }

    @GetMapping
    public List<JWTToken> getTokens() {
        // Test
        return jwtTokenService.getTokens();
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/generate")
    public ResponseEntity<JWTToken> generateToken(@RequestParam String username) {
        JWTToken jwtToken = jwtTokenService.generateAndSaveToken(username);
        return ResponseEntity.ok(jwtToken);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/check-jwttoken")
    public ResponseEntity<Boolean> checkIfJWTTokenExists(@RequestParam String username) {
        boolean exists = jwtTokenService.checkIfJWTTokenExists(username);
        return ResponseEntity.ok(exists);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteTokenByUsername(@RequestParam String username) {
        jwtTokenService.deleteTokenByUsername(username);
        return ResponseEntity.noContent().build();
    }
}
