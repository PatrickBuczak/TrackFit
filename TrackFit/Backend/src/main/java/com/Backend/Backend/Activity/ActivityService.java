package com.Backend.Backend.Activity;

import com.Backend.Backend.Activitytrack.Activitytrack;
import com.Backend.Backend.Activitytrack.ActivitytrackService;
import com.Backend.Backend.User.User;
import com.Backend.Backend.User.UserRepository;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.time.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/* @Service = markiert diese Klasse als Teil der Service-Schicht (zur Kommunikation mit der Datenbank) */
@Service
public class ActivityService {
    /* Klassenvariablen */
    private final ActivityRepository activityRepository;
    //Oguz---
    private final ActivitytrackService activitytrackService;
    private final UserRepository userRepository;
    //Oguz---


    /* automatische Dependency Injection der benötigten Objekte */
    @Autowired
    public ActivityService(ActivityRepository activityRepository, ActivitytrackService activitytrackService, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.activitytrackService = activitytrackService;
        this.userRepository = userRepository;
    }

    /* Methode: Gibt die Liste aller Likes für eine bestimmte Aktivität zurück */
    public List<String> getAllLikes(Long activityid) {
        // Hole die Aktivität anhand der ID
        Activity activity = getActivityById(activityid);

        // Gibt die Liste der Likes zurück oder eine leere Liste, falls keine vorhanden ist
        return activity.getLikes() != null ? activity.getLikes() : new ArrayList<>();
    }

    /* Methode: Fügt einen Like zu einer Aktivität hinzu */
    public String likeActivity(Long activityid, String username) {
        // Hole die Aktivität anhand der ID
        Activity activity = getActivityById(activityid);

        // Überprüfe, ob der Benutzer versucht, seine eigene Aktivität zu liken
        if (activity.getUsername().equals(username)) {
            return "Du kannst deine eigene Aktivität nicht liken.";
        }

        // Hole die Liste der Likes
        List<String> likes = activity.getLikes();

        // Überprüfe, ob der Benutzer die Aktivität bereits geliked hat
        if (likes != null && likes.contains(username)) {
            return "Du hast diese Aktivität bereits geliked.";
        }

        // Initialisiere die Liste der Likes, falls sie null ist
        if (likes == null) {
            likes = new ArrayList<>();
        }

        // Füge den Benutzer der Liste der Likes hinzu
        likes.add(username);
        activity.setLikes(likes);

        // Speichere die Aktivität in der Datenbank
        activityRepository.save(activity);
        return "Aktivität erfolgreich geliked.";
    }

    /* Methode: Entfernt einen Like von einer Aktivität */
    public String unlikeActivity(Long activityid, String username) {
        // Hole die Aktivität anhand der ID
        Activity activity = getActivityById(activityid);

        // Hole die Liste der Likes
        List<String> likes = activity.getLikes();

        // Überprüfe, ob die Aktivität nicht geliked wurde oder der Benutzer nicht in der Liste ist
        if (likes == null || !likes.contains(username)) {
            return "Du hast diese Aktivität nicht geliked.";
        }

        // Entferne den Benutzer aus der Liste der Likes
        likes.remove(username);
        activity.setLikes(likes);

        // Speichere die Aktivität in der Datenbank
        activityRepository.save(activity);
        return "Like erfolgreich entfernt.";
    }


    /* Bestehende Methoden bleiben unverändert */

    public List<Activity> getActivitys() {
        return activityRepository.findAll();
    }

    public List<Activity> getActivitiesByUsername(String username) {
        return activityRepository.findByUsername(username);
    }

    /* Methode zur Erstellung von Aktivitäten, mit Angabe der Sichtbarkeit und mit optionaler Angabe des Typs und Namens */
    //Oguz---
    public Activity createActivity(String activityname, String activitytype, String visibility, MultipartFile gpxFile, String username) {
        if (gpxFile.isEmpty()) {
            throw new IllegalArgumentException("GPX-Datei ist leer.");
        }

        User user = userRepository.findByUsername(username); //User aus der DB rufen

        Activity activity = new Activity(); // Neues Activity erstellt und Parameter gesetzt
        activity.setActivityname(activityname);
        activity.setActivitytype(activitytype);
        activity.setUsername(user.getUsername());
        activity.setVisibility(visibility);


        Activity savedActivity = activityRepository.save(activity); //Speicher die activity und bekommt von der DB eine activityid weil in Activity Klasse @ID
        Activitytrack activitytrack = activitytrackService.parseAndSaveGpxFile(gpxFile, savedActivity.getActivityid(), savedActivity.getActivityname(), savedActivity.getActivitytype()); //GPX Datei wird geparst und Activitytrack speichern

        LocalDate activityDate = extractActivityDate(activitytrack); // Ruft Methode um Datum aus der GPX zu bekommen
        activity.setActivitydate(activityDate);


        double calculateTotalDurationInMinutes = calculateTotalDurationInSeconds(activitytrack);
        double averageSpeed = ((savedActivity.getTotaldistanceMet() / 1000) / (calculateTotalDurationInMinutes / 3600));
        int caloriesBurned = calculateCalories(calculateTotalDurationInMinutes, savedActivity.getActivitytype(), user.getWeight());

        savedActivity.setAveragespeedkmh(averageSpeed);
        savedActivity.setCalorieconsumoption(caloriesBurned);

        savedActivity.setTotaldurationMin(calculateTotalDurationInMinutes);

        return activityRepository.save(savedActivity);
    }


    /* Berechnung der Gesamtzeit, Startzeit bis Endzeit gemäß GPX Zeitstempel, in Sekunden  */
    protected double calculateTotalDurationInSeconds(Activitytrack activitytrack) {
        try {//Extrahiert die Zeitstempel GPX als JSON Repräsentation
            JSONArray trackPoints = new JSONArray(activitytrack.getActivitytrackJson());
            if (trackPoints.length() < 2) {
                return 0.0;
            }

            String startTimeStr = trackPoints.getJSONObject(0).getString("time");
            String endTimeStr = trackPoints.getJSONObject(trackPoints.length() - 1).getString("time");

            if (startTimeStr == null || endTimeStr == null) {
                throw new RuntimeException("Zeitstempel fehlt");
            }
            Instant startTime = Instant.parse(startTimeStr);
            Instant endTime = Instant.parse(endTimeStr);

            /* Berechnet dauer zwischen start und ende */
            Duration duration = Duration.between(startTime, endTime);
            double durationInSeconds = duration.toSeconds();
            return durationInSeconds;
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Berechnen der Dauer: " + e.getMessage());
        }
    }

    /* Methode zur Extrahierung des Aktivitätsdatums */
    protected LocalDate extractActivityDate(Activitytrack activitytrack) {
        try { //Das selbe aber Datum nur
            JSONArray trackPoints = new JSONArray(activitytrack.getActivitytrackJson());
            if (trackPoints.length() < 1) {
                throw new RuntimeException("Keine Trackpunkte gefunden");
            }
            String startTimestr = trackPoints.getJSONObject(0).getString("time");
            if (startTimestr == null) {
                throw new RuntimeException("Zeitstempel fehlt");
            }
            Instant startTime = Instant.parse(startTimestr);
            return LocalDateTime.ofInstant(startTime, ZoneId.systemDefault()).toLocalDate();
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Extrahieren des Datums: " + e.getMessage());
        }
    }


    /* Methode zur Berechnung des Kalorienverbrauchs in Abhängigkeit der Dauer, des Gewichts und des Aktivitätentypen (met) */
    private int calculateCalories(double totalDurationInSeconds, String activitytype, double weightKg) {


        double met = switch (activitytype) {
            case "Radfahren" -> 7.5;
            case "Spazieren" -> 3.0;
            case "Wandern" -> 5.3;
            case "Laufen" -> 8.8;
            default -> 1.0;
        };
        return (int) ((totalDurationInSeconds / 60) * (met * 3.5 * weightKg) / 200);
    }

    /* Getter für alle Aktivitäten */
    public List<Activity> getAllActivities() { // Um alle AktivitÃ¤ten zurÃ¼ck zu geben
        return activityRepository.findAll();
    }


    /* Getter für eine Aktivität gemäß activity-id */
    public Activity getActivityById(Long activityid) { //Um eine AktivitÃ¤t nach der ID zurÃ¼ck zu geben
        return activityRepository.findById(activityid)
                .orElseThrow(() -> new RuntimeException("AktivitÃ¤t nicht gefunden"));
    }

    //Oguz---

    //Oguz Zyklus 3

    public List<Map<String, Object>> getActivitySummaryForYear(int year, String username) {


        // Alle Aktivitäten des Benutzers holen und nach Jahr filtern
        List<Activity> allActivities = activityRepository.findByUsername(username).stream() //Ruft Aktivität von user aus
                .filter(activity -> activity.getActivitydate() != null && activity.getActivitydate().getYear() == year) //Überprüft ob das Jahr nicht null ist und schaut ob activity year mit dem ausgewählten year übereinstimmt
                .toList(); //Konventiert stream zu einer liste



        // Ergebnisliste für die monatliche Zusammenfassung
        List<Map<String, Object>> monthlySummary = new ArrayList<>(); //Speichert die zusammengefassten Statistiken für jeden Monat

        // Schleife durch alle Monate des Jahres
        for (int month = 1; month <= 12; month++) {
            List<Activity> activitiesForMonth = new ArrayList<>(); //Speichert die Aktivitäten für die Monate

            for (Activity activity : allActivities) { //Iteriert durch alle Aktivitäten
                List<Activitytrack> activityTracks = activitytrackService.getActivityTracksByActivityId(activity.getActivityid()); //Ruft actvivitys nach id auf

                if (activityTracks.isEmpty()) {
                    System.out.println("No activity tracks found for activity ID: " + activity.getActivityid());
                    continue;
                }

                Activitytrack activitytrack = activityTracks.get(0); //Nehmen erste Tracking daten
                LocalDate activityDate = extractActivityDate(activitytrack); // Extrahieren das Datum aus den Daten

                if (activityDate.getMonthValue() == month) { //Wenn das Datum mit dem Monat übereinstimmt wird es in die Liste gespeichert
                    activitiesForMonth.add(activity);
                }
            }

            // Berechnungen für diesen Monat
            double totalDuration = activitiesForMonth.stream().mapToDouble(Activity::getTotaldurationMin).sum();
            double totalDistance = activitiesForMonth.stream().mapToDouble(Activity::getTotaldistanceMet).sum();
            double averageSpeed = activitiesForMonth.stream().mapToDouble(Activity::getAveragespeedkmh).average().orElse(0.0);
            double maxSpeed = activitiesForMonth.stream().mapToDouble(Activity::getAveragespeedkmh).max().orElse(0.0);
            double caloriesBurned = activitiesForMonth.stream().mapToDouble(Activity::getCalorieconsumoption).sum();
            double totalAltitude = activitiesForMonth.stream().mapToDouble(Activity::getAltitudemeters).sum();
            int activityCount = activitiesForMonth.size();

            // Monatliche Zusammenfassung erstellen
            Map<String, Object> monthlySummaryMap = new HashMap<>();
            monthlySummaryMap.put("month", month);
            monthlySummaryMap.put("totalDuration", totalDuration);
            monthlySummaryMap.put("totalDistance", totalDistance);
            monthlySummaryMap.put("averageSpeed", averageSpeed);
            monthlySummaryMap.put("maxSpeed", maxSpeed);
            monthlySummaryMap.put("caloriesBurned", caloriesBurned);
            monthlySummaryMap.put("totalAltitude", totalAltitude);
            monthlySummaryMap.put("activityCount", activityCount);

            // Zur Ergebnisliste hinzufügen
            monthlySummary.add(monthlySummaryMap);
        }

        return monthlySummary;
    }
}
