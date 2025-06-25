package com.Backend.Backend.Activity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/* definiert die Klasse als REST-Controller zur HTTP Verarbeitung und legt die Endpunkt-URL fest */
@RestController
@RequestMapping(path = "api/v1/activity")
public class ActivityController {

    private final ActivityService activityService;
    private final ActivityRepository activityRepository;

    /* Spring injiziert automatisch Instanzen von ActivityService und -Repo */
    @Autowired
    public ActivityController(ActivityService activityService, ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
        this.activityService = activityService;
    }

    /* erlaubt Angular CrossOrigin-Anfragen via gegebene Ports und setzt entsprechende GetMappings/http-Endpunkte */
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/by-username")
    public List<Activity> getActivitiesByUsername(@RequestParam String username) {
        //all activities
        return activityService.getActivitiesByUsername(username);
    }

    //Oguz---
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("all")
    public ResponseEntity<List<Activity>> getAllActivities() {
        List<Activity> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/{activityid}")
    public ResponseEntity<Activity> getActivityById(@PathVariable Long activityid) {
        Activity activity = activityService.getActivityById(activityid);
        return ResponseEntity.ok(activity);
    }

    // **Neue Methode: Gibt die gesamte Likes-Liste für eine Aktivität zurück**
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/{activityid}/likes")
    public ResponseEntity<List<String>> getAllLikes(@PathVariable Long activityid) {
        List<String> likes = activityService.getAllLikes(activityid);
        return ResponseEntity.ok(likes);
    }

    // Fügt einen Like hinzu
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/{activityid}/like")
    public ResponseEntity<String> likeActivity(@PathVariable Long activityid, @RequestParam String username) {
        String result = activityService.likeActivity(activityid, username);
        return ResponseEntity.ok(result);
    }

    // Entfernt einen Like
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @DeleteMapping("/{activityid}/unlike")
    public ResponseEntity<String> unlikeActivity(@PathVariable Long activityid, @RequestParam String username) {
        String result = activityService.unlikeActivity(activityid, username);
        return ResponseEntity.ok(result);
    }


    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/activities-summary/{year}/{username}")
    public ResponseEntity<List<Map<String, Object>>> getActivitySummaryForYear(@PathVariable int year, @PathVariable String username) {
        try {
            System.out.println("API aufgerufen mit Jahr: " + year + " und Benutzername: " + username);
            List<Map<String, Object>> summary = activityService.getActivitySummaryForYear(year, username);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }


    }
}

//Oguz---