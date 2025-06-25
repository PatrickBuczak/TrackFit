//Karan---

package com.Backend.Backend.User;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table
public class User {
    //Ein User kann ein regulärer Benutzer oder ein Administrator sein! Diese bestehen aus folgenden Variablen.
    //Variablen---
    @Id //id wird als primärschlüssel verwendet, um Datenbankeinträge in den Usertabeln eindeutig zu bestimmen
    @SequenceGenerator(//zur Generierung eindeutiger Werte für id
            name="user_sequence", //Name des Generators
            sequenceName="user_sequence",//Name in der Datenbank
            allocationSize = 1//jeder Wert wird einzelnt generiert
    )
    @GeneratedValue(//Stratgie des Generators
            strategy = GenerationType.SEQUENCE,//Sequenz in der Datenbank gespeichert
            generator = "user_sequence"//=sequenceName bzw. der zuvor benannte Generator
    )
    private Long id;
    //Durch die register.component.ts wird gewährleistet, dass auch der username einzigartig / eindeutig ist

    @Column(name = "username", nullable = false, unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8_bin")
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private LocalDate dateofbirth;
    private double bodysize;
    private double weight;
    private String gender;
    private String password;
    @Column(columnDefinition = "LONGTEXT")//weil in BaseString konvertierte Bilder sehr groß sind
    private String profilepicture;
    private String role;
    //Savety first: Die private deklarierungen stellen sicher, dass die Variablen nur in dieser Klasse zentral verändert werden können. Ein direkter Zugriff von außen wird verhindert.
    //Kontrollierte Zugriffe werden über die Getter- und Setter-Methoden bereitgestellt.


    //Konstruktoren---

    //Leerer Konstruktor
    public User() {
    }

    //Konstruktor für einen regulrären Benutzer mit Profilbild und mit ID
    public User(Long id, String username, String firstname, String lastname, String email, LocalDate dateofbirth, double bodysize, double weight, String gender, String password, String profilepicture, String role) {
        this.id = id;
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.dateofbirth = dateofbirth;
        this.bodysize = bodysize;
        this.weight = weight;
        this.gender = gender;
        this.password = password;
        this.profilepicture = profilepicture;
        this.role = role;
    }
    //Konstruktor für einen regulrären Benutzer mit Profilbild und ohne ID
    public User(String username, String firstname, String lastname, String email, LocalDate dateofbirth, double bodysize, double weight, String gender, String password, String profilepicture, String role) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.dateofbirth = dateofbirth;
        this.bodysize = bodysize;
        this.weight = weight;
        this.gender = gender;
        this.password = password;
        this.profilepicture = profilepicture;
        this.role = role;
    }

    //Konstruktor für einen regulrären Benutzer ohne Profilbild und mit ID
    public User(Long id, String username, String firstname, String lastname, String email, LocalDate dateofbirth, double bodysize, double weight, String gender, String password, String role) {
        this.id = id;
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.dateofbirth = dateofbirth;
        this.bodysize = bodysize;
        this.weight = weight;
        this.gender = gender;
        this.password = password;
        this.role = role;
    }

    //Konstruktor für einen regulrären Benutzer ohne Profilbild und ohne ID
    public User(String username, String firstname, String lastname, String email, LocalDate dateofbirth, double bodysize, double weight, String gender, String password, String role) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.dateofbirth = dateofbirth;
        this.bodysize = bodysize;
        this.weight = weight;
        this.gender = gender;
        this.password = password;
        this.role = role;
    }

    //Konstruktor für einen Administrator mit Profilbild und mit ID
    public User(Long id, String username, String firstname, String lastname, String email, String password, String profilepicture, String role) {
        this.id = id;
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.profilepicture = profilepicture;
        this.role = role;
    }

    //Konstruktor für einen Administrator mit Profilbild und ohne ID
    public User(String username, String firstname, String lastname, String email, String password, String profilepicture, String role) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.profilepicture = profilepicture;
        this.role = role;
    }

    //Konstruktor für einen Administrator ohne Profilbild und mit ID
    public User(Long id, String username, String firstname, String lastname, String email, String password, String role) {
        this.id = id;
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //Konstruktor für einen Administrator ohne Profilbild und ohne ID
    public User(String username, String firstname, String lastname, String email, String password, String role) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    //Ohne ID weil diese automatisch generiert wird.

    //Getter und Setter---

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

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public LocalDate getDateofbirth() {
        return dateofbirth;
    }

    public void setDateofbirth(LocalDate dateofbirth) {
        this.dateofbirth = dateofbirth;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public double getBodysize() {
        return bodysize;
    }

    public void setBodysize(double bodysize) {
        this.bodysize = bodysize;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfilepicture() {
        return profilepicture;
    }

    public void setProfilepicture(String profilepicture) {
        this.profilepicture = profilepicture;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    //to-String---

    @Override
    public String toString() {//Gibt einen objektbeschreibendes User in form eines Strings zurück ... User{...}
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", dateofbirth=" + dateofbirth +
                ", bodysize=" + bodysize +
                ", weight=" + weight +
                ", gender='" + gender + '\'' +
                ", password='" + password + '\'' +
                ", profilepicture='" + profilepicture + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
//Karan---
