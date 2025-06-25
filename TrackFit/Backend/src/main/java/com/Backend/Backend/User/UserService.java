//Karan---
package com.Backend.Backend.User;

import com.Backend.Backend.Friends.Friends;
import com.Backend.Backend.Friends.FriendsRepository;
import com.Backend.Backend.Friends.FriendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Der Service umfasst die Methodenlogik der Anfragen aus dem Controller und wird im Controller aufgerufen.
// Als @Service wird die Klasse als Service-Komponente in Spring deklariert.
@Service
public class UserService {

    private final UserRepository userRepository;
    private final FriendsRepository friendsRepository;
    private final FriendsService friendsService;

    @Autowired
    public UserService(UserRepository userRepository, FriendsRepository friendsRepository, FriendsService friendsService) {
        this.userRepository = userRepository;
        this.friendsRepository = friendsRepository;
        this.friendsService = friendsService;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public boolean checkIfEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean checkIfUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public void addUser(User user) {
        userRepository.save(user);

        // Erstelle einen Eintrag in der Freundestabelle
        Friends friends = new Friends();
        friends.setUsername(user.getUsername());
        friends.setRole(user.getRole());
        friends.setFriends(new ArrayList<>());
        friends.setFriendrequestIn(new ArrayList<>());
        friends.setFriendrequestOut(new ArrayList<>());
        friends.setVisibility("public"); // Standard-Sichtbarkeit

        friendsService.createFriendsEntry(friends);
    }

    public boolean checkFriendsEntry(String username) {
        return friendsRepository.existsByUsername(username);
    }

    public boolean validateUser(String username, String password) {
        User user = userRepository.findByUsername(username); // case-sensitive Suche
        if (user != null && user.getPassword().equals(password)) {
            return true;
        }
        return false;
    }


    public String getUserRole(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getRole();
        }
        return null;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<String> getAllUsernames(String excludeUsername) {
        return userRepository.findAll().stream()
                .map(User::getUsername)
                .filter(username -> !username.equalsIgnoreCase(excludeUsername))
                .collect(Collectors.toList());
    }

}
//Karan---
