package com.Backend.Backend.Friends;

import jakarta.persistence.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// Die Entitätsklasse Friends repräsentiert die Tabelle "friends" in der Datenbank.
// Sie enthält alle notwendigen Informationen für die Freundschaftsfunktionalität eines Benutzers.
@Entity
@Table(name = "friends") // Verknüpft diese Klasse mit der Tabelle "friends".
public class Friends {

    @Id // Markiert das Feld als Primärschlüssel.
    @SequenceGenerator( // Definiert eine Sequenz, um IDs automatisch zu generieren.
            name = "friends_sequence",
            sequenceName = "friends_sequence",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "friends_sequence") // Automatische ID-Generierung.
    private Long id; // Eindeutige ID für jeden Eintrag.

    private String username; // Der Benutzername des Benutzers.
    private String role; // Rolle des Benutzers (z. B. Benutzer oder Administrator).

    @Convert(converter = ListToStringConverter.class) // Konvertiert die Liste der Freunde in einen JSON-String für die Datenbank.
    private List<String> friends; // Liste der Freunde des Benutzers.

    @Convert(converter = ListToStringConverter.class)
    private List<String> friendrequestIn; // Liste der erhaltenen Freundschaftsanfragen.

    @Convert(converter = ListToStringConverter.class)
    private List<String> friendrequestOut; // Liste der gesendeten Freundschaftsanfragen.

    private String visibility; // Sichtbarkeit der Freundesliste (z. B. "public" oder "private").

    // Standardkonstruktor (erforderlich für JPA).
    public Friends() {
    }

    // Konstruktor mit allen Feldern.
    public Friends(Long id, String username, String role, List<String> friends, List<String> friendrequestIn, List<String> friendrequestOut, String visibility) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.friends = friends;
        this.friendrequestIn = friendrequestIn;
        this.friendrequestOut = friendrequestOut;
        this.visibility = visibility;
    }

    // Konstruktor ohne ID (für neue Benutzer).
    public Friends(String username, String role, List<String> friends, List<String> friendrequestIn, List<String> friendrequestOut, String visibility) {
        this.username = username;
        this.role = role;
        this.friends = friends;
        this.friendrequestIn = friendrequestIn;
        this.friendrequestOut = friendrequestOut;
        this.visibility = visibility;
    }

    // Getter- und Setter-Methoden für alle Felder.
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getFriends() {
        return friends;
    }

    public void setFriends(List<String> friends) {
        this.friends = friends;
    }

    public List<String> getFriendrequestIn() {
        return friendrequestIn;
    }

    public void setFriendrequestIn(List<String> friendrequestIn) {
        this.friendrequestIn = friendrequestIn;
    }

    public List<String> getFriendrequestOut() {
        return friendrequestOut;
    }

    public void setFriendrequestOut(List<String> friendrequestOut) {
        this.friendrequestOut = friendrequestOut;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    // Überschreibt die `toString()`-Methode für eine leicht lesbare Darstellung des Objekts.
    @Override
    public String toString() {
        return "Friends{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", friends=" + friends +
                ", friendrequestIn=" + friendrequestIn +
                ", friendrequestOut=" + friendrequestOut +
                ", visibility='" + visibility + '\'' +
                '}';
    }

    // **ListToStringConverter**
    // Hilfsklasse, um Listen in Strings umzuwandeln und umgekehrt (für die Datenbank).
    @Converter
    public static class ListToStringConverter implements AttributeConverter<List<String>, String> {
        private final ObjectMapper objectMapper = new ObjectMapper();

        // Konvertiert eine Liste in einen JSON-String.
        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            try {
                return (attribute == null || attribute.isEmpty()) ? "[]" : objectMapper.writeValueAsString(attribute);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Error converting list to JSON", e);
            }
        }

        // Konvertiert einen JSON-String zurück in eine Liste.
        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try {
                return (dbData == null || dbData.isEmpty()) ? new ArrayList<>() : objectMapper.readValue(dbData, new TypeReference<>() {});
            } catch (IOException e) {
                throw new IllegalArgumentException("Error converting JSON to list", e);
            }
        }
    }
}
