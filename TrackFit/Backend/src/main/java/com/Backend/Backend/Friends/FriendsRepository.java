package com.Backend.Backend.Friends;

import com.Backend.Backend.Friends.Friends;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// **FriendsRepository**
// Diese Schnittstelle erweitert `JpaRepository`, wodurch grundlegende CRUD-Operationen (Create, Read, Update, Delete) für die `Friends`-Entität verfügbar gemacht werden.
// Sie definiert auch benutzerdefinierte Methoden für spezifische Anforderungen.
public interface FriendsRepository extends JpaRepository<Friends, Long> {

    // **findByUsername**
    // Sucht einen `Friends`-Eintrag basierend auf dem Benutzernamen.
    // Gibt ein `Optional` zurück, da der Benutzer möglicherweise nicht existiert.
    // Beispiel: Wird verwendet, um die Freundesliste eines bestimmten Benutzers abzurufen.
    Optional<Friends> findByUsername(String username);

    // **existsByUsername**
    // Prüft, ob ein Eintrag mit einem bestimmten Benutzernamen existiert.
    // Gibt `true` zurück, wenn der Benutzername vorhanden ist, andernfalls `false`.
    // Beispiel: Kann verwendet werden, um sicherzustellen, dass keine Duplikate in der Datenbank erstellt werden.
    boolean existsByUsername(String username);

    // **findByUsernameIgnoreCase**
    // Sucht einen `Friends`-Eintrag basierend auf dem Benutzernamen (case-insensitive).
    Optional<Friends> findByUsernameIgnoreCase(String username);
}
