package com.Backend.Backend.Activity;

import com.Backend.Backend.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/* definiert als Repository und erweitert das JPA-Repo/erlaubt die Datenbankabfrage per automatisierten Query statt manuellem SQL */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUsername(@Param("username") String username);

}
