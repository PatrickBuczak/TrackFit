package com.Backend.Backend.Activitytrack;

import com.Backend.Backend.Activity.Activity;
import com.Backend.Backend.Activity.ActivityRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


//Stellt sicher als Service klasse da ist
@Service
public class ActivitytrackService {

    private final ActivitytrackRepository activitytrackRepository;
    private final ActivityRepository activityRepository;

// Stellt sicher das die Repositorys  auf den Service zugreifen können
    @Autowired
    public ActivitytrackService(ActivitytrackRepository activitytrackRepository, ActivityRepository activityRepository) {
        this.activitytrackRepository = activitytrackRepository;
        this.activityRepository = activityRepository;

    }

    // Erstellt eine Liste umd die Trackpoints zu speichern
    public Activitytrack parseAndSaveGpxFile(MultipartFile gpxFile, Long activityid,String activityname, String activitytype) {

        double totalDistance = 0; //Gesamt strecke
        double totalElevationGain = 0; //Gesamt hÃ¶he
        JSONArray trackPointsArray = new JSONArray(); //Neues JSON um trckpoints zu safen


        try {
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();// Gibt instanzen fÃ¼r DocumentBuilder
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();// Diese beiden Zeilen sind da um eine XML parser zu erstellen um die GPX Datei einzulesen
            Document doc = dBuilder.parse(gpxFile.getInputStream()); //Liest die Datei
            doc.getDocumentElement().normalize();//Normalisiert das Dokument um sie einheitlich zu machen
            if(activityname==null ||activityname.isEmpty()) {
                NodeList nameNodeList = doc.getElementsByTagName("name");
                if (nameNodeList.getLength() > 0) {
                    activityname = nameNodeList.item(0).getTextContent();

                }
            }
//Um den Typ in der datei zu finden und anzuzeigen
            if (activitytype == null || activitytype.isEmpty()) {
                NodeList typeNodeList = doc.getElementsByTagName("type");
                if (typeNodeList.getLength() > 0) {
                    activitytype = typeNodeList.item(0).getTextContent().trim();

                    activitytype = switch (activitytype.toLowerCase()) {
                        case "running", "laufen" -> "Laufen";
                        case "cycling", "radfahren" -> "Radfahren";
                        case "hiking", "wandern" -> "Wandern";
                        case "walking", "spazieren" -> "Spazieren";
                        default -> "Unbekannt";
                    };
                }
            }



            NodeList nodeList = doc.getElementsByTagName("trkpt"); //Sucht nacht trackpoint
            JSONObject prevPoint = null;


            for (int i = 0; i < nodeList.getLength(); i++) {
                Node n = nodeList.item(i);
                if (n.getNodeType() == Node.ELEMENT_NODE) {
                    Element e = (Element) n;

                    if (e.hasAttribute("lat") && e.hasAttribute("lon")) {
                        double latitude = Double.parseDouble(e.getAttribute("lat"));
                        double longitude = Double.parseDouble(e.getAttribute("lon"));

                        // HÃ¶hen- und Zeitwerte prÃ¼fen
                        double elevation;
                        String time;
                        if (e.getElementsByTagName("ele").getLength() > 0) {
                            elevation = Double.parseDouble(e.getElementsByTagName("ele").item(0).getTextContent());
                        } else {
                            throw new RuntimeException("Elevation  fehlt fÃ¼r einen Trackpunkt.");
                        }

                        if (e.getElementsByTagName("time").getLength() > 0) {
                            time = e.getElementsByTagName("time").item(0).getTextContent();
                        } else {
                            throw new RuntimeException("Zeitstempel fehlt fÃ¼r einen Trackpunkt.");
                        }
                        //Alles hier sind von der GPX Datei um die Werte zu extrahieren

                        JSONObject currentPoint = new JSONObject();
                        currentPoint.put("lat", latitude);
                        currentPoint.put("lon", longitude);
                        currentPoint.put("ele", elevation);
                        currentPoint.put("time", time);
                        trackPointsArray.put(currentPoint);

                        if (prevPoint != null) {

                            double distance = calculateDistance(prevPoint.getDouble("lat"), prevPoint.getDouble("lon"), latitude, longitude);
                            totalDistance += distance;

                            double elevationGain = elevation - prevPoint.getDouble("ele");
                            if (elevationGain > 0) {
                                totalElevationGain += elevationGain;
                            }

                        }
                        prevPoint = currentPoint;
                        //Erstellung eines neuen Activitytrack Objekt und zur liste hinzuzufÃ¼gen

                    }
                }
            }
            Activity activity = activityRepository.findById(activityid).orElseThrow(() -> new RuntimeException("Keine AktivitÃ¤t gefunden"));

            activity.setTotaldistanceMet(totalDistance);
            activity.setAltitudemeters(totalElevationGain);
            if(activityname!=null && !activityname.isEmpty())activity.setActivityname(activityname);
            if(activitytype!=null&& !activitytype.isEmpty()) activity.setActivitytype(activitytype);
            activityRepository.save(activity);

            Activitytrack activitytrack=new Activitytrack();
            activitytrack.setActivity(activity);

            activitytrack.setActivitytrackJson(trackPointsArray.toString());
            activitytrack.setActivityname(activityname);
            activitytrack.setActivitytype(activitytype);
            activitytrack.setUsername(activity.getUsername());
            activitytrack.setVisibility(activity.getVisibility());

            return activitytrackRepository.save(activitytrack);




        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Fehler beim Bearbeiten der GPX Datei" + e.getMessage());



        }
    }

    public List<Activitytrack> getActivityTracksByActivityId(Long activityid) {
        return activitytrackRepository.findByActivity_Activityid(activityid);
    }


    public List<Activitytrack> getAllActivitytracks() {
        return activitytrackRepository.findAll();
    }



    //Für die Distanzberechnung
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R=6371000;
        double dLat = Math.toRadians(lat2-lat1);//Winkelmaße berechnet diff zwischen Punkte
        double dLon = Math.toRadians(lon2-lon1);
        double a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);//Berechnet die kürzeste entfernung Haversine Formel
        double c=2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));//Winkelabstand
        return R * c;
    }

    // Oguz Zyklus 2
    // Koordinatendaten für eine Aktivität abrufen
    public List<Map<String,Double>> getCoordinatesByActivityId(Long activityid) throws JSONException {

        List<Activitytrack> activitytracks=  activitytrackRepository.findByActivity_Activityid(activityid);//Liste aller aktivitäten die zu der id gehören
        Activitytrack activitytrack=activitytracks.get(0); //Nimmt ersten activity aus der liste

        JSONArray trackPoints = new JSONArray(activitytrack.getActivitytrackJson());//konventiert die daten in ein JSONArray Objekt, weil die daten in string sind und wir diese umformatieren also struktur damit diese gelesen werden können
        List<Map<String,Double>> coordinates = new ArrayList<>();//Erstellt eine Liste um die coordinates zu speichern

        for(int i=0;i<trackPoints.length();i++) {//itteriert durch Liste
            JSONObject point= trackPoints.getJSONObject(i);//Holt aktuellen Punkt
            Map<String,Double> coordinate = new HashMap<>();//Erstellt eine neue Map für akutellen Punkt
            coordinate.put("lat",point.getDouble("lat"));//Fügt Lat und lon in liste
            coordinate.put("lon",point.getDouble("lon"));
            coordinates.add(coordinate);//Fügt map in die Liste

        }
        return coordinates;

    }
//Oguz




    // Patrick Zyklus 2
    // Elevationsdaten für eine Aktivität abrufen
    public List<Map<String, Object>> getElevationDataById(Long activityId) {
        // Fetch the Activitytrack for the given activity ID
        Activitytrack activitytrack = activitytrackRepository.findByActivity_Activityid(activityId).stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Keine Aktivität gefunden"));

        // Extract the JSON string from the database
        String trackJson = activitytrack.getActivitytrackJson();
        if (trackJson == null || trackJson.isEmpty()) {
            throw new RuntimeException("activitytrackJson ist leer oder null");
        }

        List<Map<String, Object>> elevationData = new ArrayList<>();

        try {
            // Parse the JSON string into a JSONArray
            JSONArray trackArray = new JSONArray(trackJson);

            // Iterate through the JSON array and process each object
            for (int i = 0; i < trackArray.length(); i++) {
                JSONObject point;
                try {
                    point = trackArray.getJSONObject(i);
                } catch (JSONException e) {
                    System.err.println("Fehler beim Abrufen eines Objekts an Index " + i + ": " + e.getMessage());
                    continue; // Skip invalid objects
                }

                // Validate the keys before accessing them
                if (point.has("time") && point.has("ele")) {
                    try {
                        String time = point.getString("time");
                        double elevation = point.getDouble("ele");

                        // Add the data point to the result list
                        Map<String, Object> dataPoint = new HashMap<>();
                        dataPoint.put("time", time);
                        dataPoint.put("elevation", elevation);
                        elevationData.add(dataPoint);
                    } catch (JSONException e) {
                        System.err.println("Fehler beim Extrahieren von Daten aus JSON-Objekt an Index " + i + ": " + e.getMessage());
                    }
                } else {
                    // Log a warning if keys are missing
                    System.err.println("Fehlende Schlüssel im JSON-Objekt an Index " + i + ": " + point);
                }
            }
        } catch (JSONException e) {
            // Throw a runtime exception if the overall JSON structure is invalid
            throw new RuntimeException("Fehler beim Parsen von activitytrackJson: " + e.getMessage(), e);
        }

        return elevationData;
    }
    // Patrick






}
