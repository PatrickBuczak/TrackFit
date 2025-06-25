package com.Backend.Backend.Activitytrack;
import com.Backend.Backend.Activity.Activity;
import com.Backend.Backend.Activity.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

//Klassifiziert die Klasse als Contriller
@RestController
@RequestMapping(path = "api/v1/activitytrack") //Zugriff auf die unternen URL
public class ActivitytrackController {
    private final ActivitytrackService activitytrackService;
    private final ActivitytrackRepository activitytrackRepository;
    private final ActivityService activityService;

    @Autowired
    public ActivitytrackController(ActivitytrackService activitytrackService, ActivitytrackRepository activitytrackRepository, ActivityService activityService) {
        this.activitytrackRepository = activitytrackRepository;
        this.activitytrackService = activitytrackService;
        this.activityService = activityService;

    }
    //Stellt sicher das ein anderer Port zugriff hat
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/{activityid}") //HTTP Endpunkt platzhalter
    //Liste von der Activitytracks zu brkommrn
    public ResponseEntity<List<Activitytrack>> getActivityTracksByActivityID(@PathVariable Long activityid) {
        List<Activitytrack> activitytracks = activitytrackService.getActivityTracksByActivityId(activityid);
        return ResponseEntity.ok(activitytracks);
    }
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping
    public List<Activitytrack> getAllActivitytracks() {
        return activitytrackRepository.findAll();
    }
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @PostMapping("/upload")
    public ResponseEntity<?> uploadActivityTrack (@RequestParam("activityname") String activityname,
                                                  @RequestParam("visibility") String visibility,
                                                  @RequestParam("activitytype") String activitytype,
                                                  @RequestParam("gpxFile") MultipartFile gpxFile,
                                                  @RequestParam("username") String username) { //Eingabewerte

        if(gpxFile.isEmpty()){
            return ResponseEntity.badRequest().body("Gpx file ist leer");
        }
        try {
            Activity activitytrack = activityService.createActivity(activityname, activitytype,visibility, gpxFile, username);
            return ResponseEntity.ok(activitytrack);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fehler beim Hochladen der Datei" + e.getMessage());
        }
    }

    //Oguz Zyklus 2
    // **NEU**: Endpunkt für Koordinatendaten
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})//Erlaubt Anfragen nur wenn URL zwischen diesen Ports ist
    @GetMapping("/{activityid}/coordinates")//Ruft eine GET Mapping Anfrage auf also es wird eine activityid in der URL erwartet. Diese wird für Koordinaten erwartet
    public ResponseEntity<List<Map<String, Double>>> getCoordinatesByActivityId(@PathVariable Long activityid) { //Es wird eine Liste zurück erwartet wo die Koordinate in einer Map gespeichert sind.Warum Map damit
        try {
            List<Map<String, Double>> coordinates = activitytrackService.getCoordinatesByActivityId(activityid);//Ruft die Koordinaten auf nach der activityid die gespeichert sind
            return ResponseEntity.ok(coordinates);//Wenn Methode erfolgreichg aufgerufen dann antwort ok und die koordinaten werden zurück gegeben
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);//Wenn es ein fehler gibt wird fehler 400 zurück gegeben
        }
    }
    //Oguz



    //Patrick Zyklus 2
    // **NEU**: Endpunkt für Elevationsdaten
    @CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
    @GetMapping("/{activityid}/elevationdata")
    public ResponseEntity<List<Map<String, Object>>> getElevationDataById(@PathVariable Long activityid) {
        // Abrufen der Elevationsdaten für eine bestimmte Aktivität
        try {
            List<Map<String, Object>> elevationData = activitytrackService.getElevationDataById(activityid);
            return ResponseEntity.ok(elevationData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    //Patrick
}
