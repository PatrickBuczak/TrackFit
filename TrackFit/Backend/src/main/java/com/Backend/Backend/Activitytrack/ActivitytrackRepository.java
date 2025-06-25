package com.Backend.Backend.Activitytrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivitytrackRepository extends JpaRepository<Activitytrack, Long> {
    //Gibt von der Activityid die spur aus
    List<Activitytrack> findByActivity_Activityid(Long activityid);
}
