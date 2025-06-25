//Karan---

package com.Backend.Backend.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Der Controller ist wie ein Zwischenmann zwischen dem Client und dem Server.
// Anfragen werden hier im Vorfeld überprüft und validiert (wurden die richtigen Werte übergeben?),
// bevor die entsprechende Methode im Service aufgerufen wird.

// Durch @RestController wird die Klasse als HTTP-Anfragen-Verarbeiter deklariert. Antworten in JSON werden zurückgegeben.
// "api/v1/user" ist der Basis-URL-Pfad für die Methoden dieser Klasse.
@RestController
@RequestMapping(path = "api/v1/user")
public class UserController {
    private final UserService userService; // Service für die Methodenlogik zuständig
    private final UserRepository userRepository; // Repository für den Datenzugriff zuständig

    @Autowired
    public UserController(UserService userService, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
    }
    // Durch Autowired werden die Abhängigkeiten zum Service und Repository automatisch injiziert

    @GetMapping
    public List<User> getUsers() {
        // Test
        return userService.getUsers();
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkIfEmailExists(@RequestParam String email) {
        boolean exists = userService.checkIfEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkIfUsernameExists(@RequestParam String username) {
        boolean exists = userService.checkIfUsernameExists(username);
        return ResponseEntity.ok(exists);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/addUser")
    public void addUser(@RequestBody User user) {
        userService.addUser(user);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/login")
    public ResponseEntity<Boolean> loginUser(@RequestParam String username, @RequestParam String password) {
        boolean isValidUser = userService.validateUser(username, password);
        return ResponseEntity.ok(isValidUser);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/get-role")
    public ResponseEntity<Boolean> getUserRole(@RequestParam String username) {
        String role = userService.getUserRole(username);
        boolean isRegularUser = "regulärer Benutzer".equals(role);
        return ResponseEntity.ok(isRegularUser);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/get-user")
    public ResponseEntity<User> getUserByUsername(@RequestParam String username) {
        User user = userService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/usernames")
    public ResponseEntity<List<String>> getAllUsernames(@RequestParam String excludeUsername) {
        List<String> usernames = userService.getAllUsernames(excludeUsername);
        return ResponseEntity.ok(usernames);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/check-friends")
    public ResponseEntity<String> checkFriendsEntry(@RequestParam String username) {
        boolean exists = userService.checkFriendsEntry(username);
        if (exists) {
            return ResponseEntity.ok("Friends entry exists for user: " + username);
        } else {
            return ResponseEntity.status(404).body("No friends entry found for user: " + username);
        }
    }

}
//Karan---
