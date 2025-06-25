package com.Backend.Backend.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Repository-Komponente in Spring durch @Repository deklariert / für den Zugriff auf die Datenbank im Kontext User zuständig.
// Durch dieses Interface werden objektorientierte Interaktionen mit der Datenbank ermöglicht.
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Existiert ein User mit der übergebenen Email? true=ja sonst nein
    boolean existsByEmail(String email);

    // Existiert ein User mit dem übergebenen Benutzernamen? true=ja sonst nein
    boolean existsByUsername(String username);

    // Gibt den Benutzer mit dem angegebenen Benutzernamen zurück (case-sensitive)
    User findByUsername(String username);

    // Gibt den Benutzer mit dem angegebenen Benutzernamen zurück (case-insensitive)
    Optional<User> findByUsernameIgnoreCase(String username);
}
