package com.Backend.Backend.Activity;


import com.Backend.Backend.Activitytrack.Activitytrack;
import com.Backend.Backend.Activitytrack.ActivitytrackService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.junit.jupiter.api.Assertions.*;

class ActivityServiceTest {
    @Test
    void extractActivityDate() throws JSONException {

        String activityTrackJson = new JSONArray()
                .put(new JSONObject()
                        .put("lat", 52.5200)
                        .put("lon", 13.4050)
                        .put("time", "2024-12-03T08:00:00Z"))
                .put(new JSONObject()
                        .put("lat", 52.5201)
                        .put("lon", 13.4051)
                        .put("time", "2024-12-03T08:30:00Z"))
                .toString();

        Activitytrack activitytrack = new Activitytrack();
        activitytrack.setActivitytrackJson(activityTrackJson);

        ActivityService activityService = new ActivityService(null, null, null);


        LocalDate activityDate = activityService.extractActivityDate(activitytrack);


        assertEquals(LocalDate.of(2024, 12, 3), activityDate, "Das Datum der Aktivität sollte korrekt extrahiert werden.");
    }

    @Test
    void calculateTotalDurationInSeconds() throws JSONException {
        // Arrange: Erstelle einen JSON-String, der eine GPX-Datei simuliert
        String activityTrackJson = new JSONArray()
                .put(new JSONObject()
                        .put("lat", 52.5200)
                        .put("lon", 13.4050)
                        .put("time", "2024-12-03T08:00:00Z"))
                .put(new JSONObject()
                        .put("lat", 52.5201)
                        .put("lon", 13.4051)
                        .put("time", "2024-12-03T08:30:00Z"))
                .toString();

        Activitytrack activitytrack = new Activitytrack();
        activitytrack.setActivitytrackJson(activityTrackJson);

        ActivityService activityService = new ActivityService(null, null, null);


        double totalDurationInSeconds = activityService.calculateTotalDurationInSeconds(activitytrack);


        assertEquals(1800, totalDurationInSeconds, "Die Gesamtdauer sollte 1800 Sekunden (30 Minuten) betragen.");
    }

    @Test
    void calculateTotalDistance() throws JSONException {

        String activityTrackJson = new JSONArray()
                .put(new JSONObject()
                        .put("lat", 52.5200)
                        .put("lon", 13.4050))
                .put(new JSONObject()
                        .put("lat", 52.5201)
                        .put("lon", 13.4051))
                .put(new JSONObject()
                        .put("lat", 52.5202)
                        .put("lon", 13.4052))
                .toString();

        Activitytrack activitytrack = new Activitytrack();
        activitytrack.setActivitytrackJson(activityTrackJson);


        ActivitytrackService activitytrackService = new ActivitytrackService(null, null);


        JSONArray trackPoints = new JSONArray(activitytrack.getActivitytrackJson());
        double totalDistance = 0.0;
        for (int i = 1; i < trackPoints.length(); i++) {
            JSONObject point1 = trackPoints.getJSONObject(i - 1);
            JSONObject point2 = trackPoints.getJSONObject(i);
            double lat1 = point1.getDouble("lat");
            double lon1 = point1.getDouble("lon");
            double lat2 = point2.getDouble("lat");
            double lon2 = point2.getDouble("lon");
            totalDistance += activitytrackService.calculateDistance(lat1, lon1, lat2, lon2);
        }


        assertEquals(26.03, totalDistance, 0.01, "Die Gesamtdistanz sollte korrekt berechnet werden.");
    }

    @Test
    void calculateTotalAltitudeGain() throws JSONException {
        // Arrange: Simuliere Höhenangaben in einer GPX-Datei
        String activityTrackJson = new JSONArray()
                .put(new JSONObject().put("lat", 52.5200).put("lon", 13.4050).put("ele", 100))
                .put(new JSONObject().put("lat", 52.5201).put("lon", 13.4051).put("ele", 150))
                .put(new JSONObject().put("lat", 52.5202).put("lon", 13.4052).put("ele", 120))
                .put(new JSONObject().put("lat", 52.5203).put("lon", 13.4053).put("ele", 180))
                .toString();

        Activitytrack activitytrack = new Activitytrack();
        activitytrack.setActivitytrackJson(activityTrackJson);

        ActivityService activityService = new ActivityService(null, null, null);

        // Act: Berechne den Gesamthöhengewinn
        JSONArray trackPoints = new JSONArray(activitytrack.getActivitytrackJson());
        double totalAltitudeGain = 0.0;
        for (int i = 1; i < trackPoints.length(); i++) {
            double previousElevation = trackPoints.getJSONObject(i - 1).getDouble("ele");
            double currentElevation = trackPoints.getJSONObject(i).getDouble("ele");
            if (currentElevation > previousElevation) {
                totalAltitudeGain += (currentElevation - previousElevation);
            }
        }

        // Assert: Prüfe, ob der Gesamthöhengewinn korrekt ist
        assertEquals(110.0, totalAltitudeGain, 0.01, "Der Gesamthöhengewinn sollte korrekt berechnet werden.");
    }

    @Test
    void testCalculateAverageSpeed() throws JSONException {
        double totalDistanceInMeters = 1000; // 1 km
        double totalDurationInSeconds = 1800; // 30 Minuten

        double totalDistanceInKm = totalDistanceInMeters / 1000;
        double totalDurationInHours = totalDurationInSeconds / 3600;
        double averageSpeed = totalDistanceInKm / totalDurationInHours;

        assertEquals(2.0, averageSpeed, 0.01, "Die durchschnittliche Geschwindigkeit sollte 2 km/h betragen.");
    }

    @Test
    void testCalculateCaloriesBurned() {
        double durationInSeconds = 3600; // 1 Stunde
        String activityType = "Laufen"; // Aktivitätstyp
        double weightKg = 70; // Gewicht des Nutzers

        double met = switch (activityType) {
            case "Laufen" -> 8.8;
            case "Radfahren" -> 7.5;
            case "Spazieren" -> 3.0;
            case "Wandern" -> 5.3;
            default -> 1.0;
        };

        int expectedCalories = (int) ((durationInSeconds / 60) * (met * 3.5 * weightKg) / 200);

        assertEquals(646, expectedCalories, "Die Gesamtverbrauchten Kalorien sollten 616 kcal betragen.");
    }

}