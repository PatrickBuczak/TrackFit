package com.Backend.Backend.Friends;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// **EmailService**
// Diese Klasse bietet die Funktionalität zum Versenden von E-Mails.
// Sie verwendet den von Spring bereitgestellten `JavaMailSender` und enthält Validierungs- sowie Fehlerbehandlungslogik.
@Service
public class EmailService {

    // **mailSender**
    // Instanz von `JavaMailSender`, die für das Senden von E-Mails verantwortlich ist.
    private final JavaMailSender mailSender;

    // **logger**
    // Logger für die Protokollierung von Ereignissen, Fehlern und wichtigen Informationen.
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // **PROJECT_EMAIL**
    // Statische Konstante, die die Absenderadresse für alle ausgehenden E-Mails definiert.
    private static final String PROJECT_EMAIL = "Trackfit@freenet.de";

    // **Konstruktor**
    // Initialisiert den `JavaMailSender` über Konstruktor-Injektion (Dependency Injection).
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // **sendEmail**
    // Versendet eine E-Mail an die angegebene Empfängeradresse.
    // Parameter:
    // - `to`: Empfängeradresse der E-Mail.
    // - `subject`: Betreff der E-Mail.
    // - `text`: Inhalt der E-Mail.
    public void sendEmail(String to, String subject, String text) {
        // Überprüfung der E-Mail-Adresse auf Gültigkeit.
        if (!isValidEmail(to)) {
            // Protokolliert eine Fehlermeldung, wenn die Adresse ungültig ist.
            logger.error("Invalid email address: {}", to);
            // Löst eine `IllegalArgumentException` aus, um den Fehler zu signalisieren.
            throw new IllegalArgumentException("Invalid email address");
        }

        try {
            // Erstellt die E-Mail-Nachricht und sendet sie.
            mailSender.send(createEmailMessage(to, subject, text));
            // Protokolliert, dass die E-Mail erfolgreich gesendet wurde.
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            // Protokolliert Details über den Fehler, falls das Senden fehlschlägt.
            logger.error("Error sending email to: {}. Cause: {}", to, e.getMessage());
            // Löst eine `RuntimeException` aus, um den Fehler weiterzugeben.
            throw new RuntimeException("Email sending failed", e);
        }
    }

    // **isValidEmail**
    // Überprüft, ob eine E-Mail-Adresse ein gültiges Format hat.
    // Parameter:
    // - `email`: Die zu überprüfende E-Mail-Adresse.
    // Rückgabewert:
    // - `true`, wenn die Adresse gültig ist.
    // - `false`, wenn die Adresse ungültig ist.
    private boolean isValidEmail(String email) {
        // Verwendet einen regulären Ausdruck, um das E-Mail-Format zu validieren.
        // Unterstützt allgemeine Formate wie `name@domain.com`.
        return email != null && email.matches("^[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$");
    }

    // **createEmailMessage**
    // Erstellt und konfiguriert eine Instanz von `SimpleMailMessage`.
    // Parameter:
    // - `to`: Empfängeradresse der E-Mail.
    // - `subject`: Betreff der E-Mail.
    // - `text`: Inhalt der E-Mail.
    // Rückgabewert:
    // - Eine fertige `SimpleMailMessage`, bereit zum Versenden.
    private SimpleMailMessage createEmailMessage(String to, String subject, String text) {
        // Erstellt eine neue `SimpleMailMessage`.
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to); // Setzt die Empfängeradresse.
        message.setSubject(subject); // Setzt den Betreff.
        message.setText(text); // Setzt den Inhalt der E-Mail.
        message.setFrom(PROJECT_EMAIL); // Setzt die Absenderadresse.
        return message; // Gibt die konfigurierte Nachricht zurück.
    }
}
