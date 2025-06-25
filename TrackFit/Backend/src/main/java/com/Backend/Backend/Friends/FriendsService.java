package com.Backend.Backend.Friends;

import com.Backend.Backend.User.User;
import com.Backend.Backend.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// **FriendsService**
// Diese Klasse enthält die Geschäftslogik für das Verwalten von Freundeslisten und -anfragen.
// Sie stellt Funktionen bereit, um Freunde hinzuzufügen, Anfragen zu verwalten und Freundeslisten zu bearbeiten.
@Service
public class FriendsService {

    private final FriendsRepository friendsRepository; // Repository für die Datenbankoperationen der "Friends"-Entität.
    private final UserRepository userRepository;       // Repository für die Datenbankoperationen der "User"-Entität.
    private final EmailService emailService;           // Service für das Versenden von E-Mails.

    // **Konstruktor**
    // Initialisiert die Repositories und den EmailService über Dependency Injection.
    @Autowired
    public FriendsService(FriendsRepository friendsRepository, UserRepository userRepository, EmailService emailService) {
        this.friendsRepository = friendsRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // **getFriends**
    // Gibt die Freundesliste eines Benutzers zurück.
    public List<String> getFriends(String username) {
        return friendsRepository.findByUsername(username)
                .map(Friends::getFriends) // Extrahiert die Freundesliste, falls der Benutzer existiert.
                .orElse(new ArrayList<>()); // Gibt eine leere Liste zurück, wenn der Benutzer nicht existiert.
    }

    // **getSentRequests**
    // Gibt die gesendeten Freundschaftsanfragen eines Benutzers zurück.
    public List<String> getSentRequests(String username) {
        return friendsRepository.findByUsername(username)
                .map(Friends::getFriendrequestOut) // Extrahiert die Liste der gesendeten Anfragen.
                .orElse(new ArrayList<>());
    }

    // **getReceivedRequests**
    // Gibt die erhaltenen Freundschaftsanfragen eines Benutzers zurück.
    public List<String> getReceivedRequests(String username) {
        return friendsRepository.findByUsername(username)
                .map(Friends::getFriendrequestIn) // Extrahiert die Liste der erhaltenen Anfragen.
                .orElse(new ArrayList<>());
    }

    // **sendFriendRequest**
    // Sendet eine Freundschaftsanfrage von einem Benutzer zu einem anderen.
    public void sendFriendRequest(String sender, String receiver) {
        Friends senderEntity = friendsRepository.findByUsername(sender)
                .orElseThrow(() -> new IllegalArgumentException("Sender does not exist."));
        Friends receiverEntity = friendsRepository.findByUsername(receiver)
                .orElseThrow(() -> new IllegalArgumentException("Receiver does not exist."));

        // Überprüft, ob die Benutzer bereits befreundet sind.
        if (senderEntity.getFriends().contains(receiver)) {
            throw new IllegalStateException("User is already in your friends list.");
        }

        // Überprüft, ob bereits eine Freundschaftsanfrage gesendet wurde.
        if (senderEntity.getFriendrequestOut().contains(receiver)) {
            throw new IllegalStateException("Friend request already sent to this user.");
        }

        // Fügt die Anfrage in die entsprechenden Listen ein.
        senderEntity.getFriendrequestOut().add(receiver);
        receiverEntity.getFriendrequestIn().add(sender);

        // Speichert die Änderungen.
        friendsRepository.save(senderEntity);
        friendsRepository.save(receiverEntity);

        // **Senden einer Benachrichtigungs-E-Mail**
        User receiverUser = userRepository.findByUsername(receiver); // Holt die Benutzerdaten.
        String subject = "Neue Freundschaftsanfrage";
        String text = String.format(
                "Hallo %s,\n\n%s hat Ihnen eine Freundschaftsanfrage gesendet.\n\nLoggen Sie sich ein, um diese zu akzeptieren oder abzulehnen.",
                receiverUser.getFirstname(), sender);

        emailService.sendEmail(receiverUser.getEmail(), subject, text); // Sendet die E-Mail.
    }

    // **acceptFriendRequest**
    // Nimmt eine Freundschaftsanfrage an.
    // Entfernt eine Freundschaftsanfrage aus der friendrequest_in-Liste des Empfängers
    public void rejectFriendRequest(String receiver, String sender) {
        Friends receiverFriend = friendsRepository.findByUsernameIgnoreCase(receiver)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + receiver));

        receiverFriend.getFriendrequestIn().remove(sender);
        friendsRepository.save(receiverFriend);
    }

    // Entfernt eine Freundschaftsanfrage aus der friendrequest_out-Liste des Senders
    public void removeRequestFromSender(String sender, String receiver) {
        Friends senderFriend = friendsRepository.findByUsernameIgnoreCase(sender)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + sender));

        senderFriend.getFriendrequestOut().remove(receiver);
        friendsRepository.save(senderFriend);
    }

    // Akzeptiert eine Freundschaftsanfrage und fügt beide Benutzer in die Freunde-Listen ein
// Akzeptiert eine Freundschaftsanfrage und fügt beide Benutzer in die Freunde-Listen ein
    public void acceptFriendRequest(String receiver, String sender) {
        Friends receiverFriend = friendsRepository.findByUsernameIgnoreCase(receiver)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + receiver));

        Friends senderFriend = friendsRepository.findByUsernameIgnoreCase(sender)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + sender));

        // Entfernt die Anfrage aus den entsprechenden Listen
        receiverFriend.getFriendrequestIn().remove(sender);
        senderFriend.getFriendrequestOut().remove(receiver);

        // Prüfe und entferne umgekehrte Anfragen, falls vorhanden
        receiverFriend.getFriendrequestOut().remove(sender);
        senderFriend.getFriendrequestIn().remove(receiver);

        // Fügt beide Benutzer in die Freunde-Listen ein
        receiverFriend.getFriends().add(sender);
        senderFriend.getFriends().add(receiver);

        // Speichert die Änderungen
        friendsRepository.save(receiverFriend);
        friendsRepository.save(senderFriend);
    }


    // **withdrawFriendRequest**
    // Zieht eine gesendete Freundschaftsanfrage zurück.
    public void withdrawFriendRequest(String sender, String receiver) {
        Friends senderEntity = friendsRepository.findByUsername(sender)
                .orElseThrow(() -> new IllegalArgumentException("Sender does not exist."));
        Friends receiverEntity = friendsRepository.findByUsername(receiver)
                .orElseThrow(() -> new IllegalArgumentException("Receiver does not exist."));

        // Entfernt die Anfrage aus den Listen.
        senderEntity.getFriendrequestOut().remove(receiver);
        receiverEntity.getFriendrequestIn().remove(sender);

        // Speichert die Änderungen.
        friendsRepository.save(senderEntity);
        friendsRepository.save(receiverEntity);
    }

    // **removeFriend**
    // Entfernt einen Freund aus der Freundesliste.
    public void removeFriend(String username, String friendUsername) {
        Friends userEntity = friendsRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User does not exist."));
        Friends friendEntity = friendsRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new IllegalArgumentException("Friend does not exist."));

        // Entfernt die Freundschaft aus beiden Listen.
        userEntity.getFriends().remove(friendUsername);
        friendEntity.getFriends().remove(username);

        // Speichert die Änderungen.
        friendsRepository.save(userEntity);
        friendsRepository.save(friendEntity);
    }

    // **getVisibility**
    // Gibt die Sichtbarkeitseinstellung eines Benutzers zurück.
    public String getVisibility(String username) {
        return friendsRepository.findByUsername(username)
                .map(Friends::getVisibility)
                .orElseThrow(() -> new IllegalArgumentException("User does not exist."));
    }

    // **toggleVisibility**
    // Ändert die Sichtbarkeit eines Benutzers zwischen "public" und "private".
    public String toggleVisibility(String username) {
        Friends userEntity = friendsRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User does not exist."));

        // Wechselt die Sichtbarkeit.
        String currentVisibility = userEntity.getVisibility();
        String newVisibility = currentVisibility.equals("public") ? "private" : "public";
        userEntity.setVisibility(newVisibility);

        // Speichert die Änderungen.
        friendsRepository.save(userEntity);
        return newVisibility;
    }

    // **createFriendsEntry**
    // Erstellt einen neuen Eintrag in der Tabelle "Friends".
    public void createFriendsEntry(Friends friends) {
        friendsRepository.save(friends);
    }
}
