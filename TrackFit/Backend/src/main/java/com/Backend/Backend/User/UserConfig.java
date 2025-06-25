package com.Backend.Backend.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
public class UserConfig {
    //Zum erstnaligen und einmaligen Hinzufügen von einem ersten Datensatz in die Datenbank
    //Durch Start des Backends
    //Nach Start und Überprüfung, dass Datensatz in der Datenbank ist Ausklammern!
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Bean
    CommandLineRunner commandLineRunner(UserRepository repository) {
        return args -> {

            String sql = "ALTER TABLE trackfit.user MODIFY profilepicture LONGTEXT";
            jdbcTemplate.execute(sql);

            //in diesem Fall wird ein Administrator eingefügt
            /*
            User user = new User(
                    "MaxB",
                    "Max",
                    "B",
                    "MaxB@outlook.de",
                    "111111",
                    "Administrator"
            );
            repository.saveAll(
                    List.of(user)
            );

             */


            //Hier automatisch 2 Reguläre Benutzer, einen Admin und je Aktivitäten hinzufügen
        };

    }
}





