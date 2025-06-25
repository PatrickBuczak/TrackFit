package com.Backend.Backend.Friends;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// **FriendsController**
// Dieser Controller ist eine REST-Schnittstelle, die HTTP-Anfragen für Freundschaftsaktionen entgegennimmt und verarbeitet.
// Er dient als Vermittler zwischen dem Client (z. B. Angular-Frontend) und der Service-Schicht.
@RestController
@RequestMapping(path = "api/v1/friends") // Basis-URL für alle Endpunkte dieses Controllers.
public class FriendsController {

    private final FriendsService friendsService; // Service-Schicht für die Geschäftslogik.

    // **Konstruktor**
    // Initialisiert die FriendsService-Instanz durch Dependency Injection.
    @Autowired
    public FriendsController(FriendsService friendsService) {
        this.friendsService = friendsService;
    }

    // **GET: /list**
    // Gibt die Freundesliste eines Benutzers zurück.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"}) // Erlaubt Cross-Origin-Anfragen von diesen URLs.
    @GetMapping("/list")
    public ResponseEntity<List<String>> getFriends(@RequestParam String username) {
        // Holt die Freundesliste des angegebenen Benutzers aus der Service-Schicht.
        List<String> friends = friendsService.getFriends(username);
        // Gibt die Freundesliste als JSON zurück (HTTP-Status 200).
        return ResponseEntity.ok(friends);
    }

    // **DELETE: /remove-friend**
    // Entfernt einen Freund aus der Freundesliste eines Benutzers.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @DeleteMapping("/remove-friend")
    public ResponseEntity<String> removeFriend(@RequestParam String username, @RequestParam String friendUsername) {
        // Ruft die Service-Methode auf, um den Freund zu entfernen.
        friendsService.removeFriend(username, friendUsername);
        // Gibt eine Erfolgsnachricht zurück.
        return ResponseEntity.ok("Friend successfully removed.");
    }

    // **GET: /sent-requests**
    // Gibt die Liste der gesendeten Freundschaftsanfragen eines Benutzers zurück.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/sent-requests")
    public ResponseEntity<List<String>> getSentRequests(@RequestParam String username) {
        // Holt die gesendeten Freundschaftsanfragen aus der Service-Schicht.
        List<String> sentRequests = friendsService.getSentRequests(username);
        // Gibt die Liste der gesendeten Anfragen zurück.
        return ResponseEntity.ok(sentRequests);
    }

    // **GET: /received-requests**
    // Gibt die Liste der erhaltenen Freundschaftsanfragen eines Benutzers zurück.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/received-requests")
    public ResponseEntity<List<String>> getReceivedRequests(@RequestParam String username) {
        // Holt die erhaltenen Freundschaftsanfragen aus der Service-Schicht.
        List<String> receivedRequests = friendsService.getReceivedRequests(username);
        // Gibt die Liste der erhaltenen Anfragen zurück.
        return ResponseEntity.ok(receivedRequests);
    }

    // **POST: /send-request**
    // Sendet eine Freundschaftsanfrage von einem Benutzer zu einem anderen.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/send-request")
    public ResponseEntity<String> sendFriendRequest(@RequestParam String sender, @RequestParam String receiver) {
        // Ruft die Service-Methode auf, um die Freundschaftsanfrage zu senden.
        friendsService.sendFriendRequest(sender, receiver);
        // Gibt eine Erfolgsnachricht zurück.
        return ResponseEntity.ok("Friend request sent successfully.");
    }

    // **POST: /accept-request**
    // Nimmt eine Freundschaftsanfrage an.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/accept-request")
    public ResponseEntity<String> acceptFriendRequest(@RequestParam String receiver, @RequestParam String sender) {
        try {
            // Akzeptiert die Freundschaftsanfrage und aktualisiert die Listen
            friendsService.acceptFriendRequest(receiver, sender);

            // Entfernt die Anfrage aus der friendrequest_out des Senders
            friendsService.removeRequestFromSender(sender, receiver);

            // Gibt eine Erfolgsnachricht zurück
            return ResponseEntity.ok("Friend request accepted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to accept friend request: " + e.getMessage());
        }
    }


    // **POST: /reject-request**
    // Lehnt eine Freundschaftsanfrage ab.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/reject-request")
    public ResponseEntity<String> rejectFriendRequest(@RequestParam String receiver, @RequestParam String sender) {
        try {
            // Entfernt die Anfrage aus der friendrequest_in des Empfängers
            friendsService.rejectFriendRequest(receiver, sender);

            // Entfernt die Anfrage aus der friendrequest_out des Senders
            friendsService.removeRequestFromSender(sender, receiver);

            // Gibt eine Erfolgsnachricht zurück
            return ResponseEntity.ok("Friend request rejected successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to reject friend request: " + e.getMessage());
        }
    }


    // **POST: /withdraw-request**
    // Zieht eine gesendete Freundschaftsanfrage zurück.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/withdraw-request")
    public ResponseEntity<String> withdrawFriendRequest(@RequestParam String sender, @RequestParam String receiver) {
        // Ruft die Service-Methode auf, um die Freundschaftsanfrage zurückzuziehen.
        friendsService.withdrawFriendRequest(sender, receiver);
        // Gibt eine Erfolgsnachricht zurück.
        return ResponseEntity.ok("Friend request withdrawn successfully.");
    }

    // **GET: /visibility**
    // Fragt die Sichtbarkeit der Freundesliste eines Benutzers ab.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/visibility")
    public ResponseEntity<String> getVisibility(@RequestParam String username) {
        // Holt die Sichtbarkeit aus der Service-Schicht.
        String visibility = friendsService.getVisibility(username);
        // Gibt die Sichtbarkeit zurück.
        return ResponseEntity.ok(visibility);
    }

    // **POST: /change-visibility**
    // Ändert die Sichtbarkeit der Freundesliste eines Benutzers.
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/change-visibility")
    public ResponseEntity<String> changeVisibility(@RequestParam String username) {
        // Ruft die Service-Methode auf, um die Sichtbarkeit zu ändern.
        String newVisibility = friendsService.toggleVisibility(username);
        // Gibt die neue Sichtbarkeit zurück.
        return ResponseEntity.ok("Visibility changed to: " + newVisibility);
    }
}
