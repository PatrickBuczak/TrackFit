package com.Backend.Backend.Activity;

import jakarta.persistence.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity") // Verknüpft die Klasse mit der Tabelle "activity".
public class Activity {

    @Id // Markiert das Feld als Primärschlüssel.
    @SequenceGenerator(
            name = "activity_sequence",
            sequenceName = "activity_sequence",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "activity_sequence")
    private Long activityid; // Eindeutige ID für jede Aktivität.

    private String username; // Benutzername des Erstellers der Aktivität.
    private String activityname; // Name der Aktivität.
    private String activitytype; // Typ der Aktivität (z. B. "Laufen").
    private LocalDate activitydate; // Datum der Aktivität.
    private double totaldurationMin; // Gesamtdauer in Minuten.
    private double totaldistanceMet; // Gesamtdistanz in Metern.
    private double averagespeedkmh; // Durchschnittsgeschwindigkeit in km/h.
    private double altitudemeters; // Höhe in Metern.
    private Integer calorieconsumoption; // Kalorienverbrauchsoption.
    private String visibility; // Sichtbarkeit der Aktivität (z. B. "public" oder "private").

    @Convert(converter = ListToStringConverter.class) // Konvertiert die Liste in einen JSON-String für die Datenbank.
    private List<String> likes; // Liste der Benutzer, die die Aktivität geliked haben.

    // Standardkonstruktor
    public Activity() {
    }

    // Konstruktor mit allen Feldern
    public Activity(Long activityid, String username, String activityname, String activitytype, LocalDate activitydate,
                    double totaldurationMin, double totaldistanceMet, double averagespeedkmh, double altitudemeters,
                    Integer calorieconsumoption, String visibility, List<String> likes) {
        this.activityid = activityid;
        this.username = username;
        this.activityname = activityname;
        this.activitytype = activitytype;
        this.activitydate = activitydate;
        this.totaldurationMin = totaldurationMin;
        this.totaldistanceMet = totaldistanceMet;
        this.averagespeedkmh = averagespeedkmh;
        this.altitudemeters = altitudemeters;
        this.calorieconsumoption = calorieconsumoption;
        this.visibility = visibility;
        this.likes = likes;
    }

    // Getter und Setter für alle Felder
    public Long getActivityid() {
        return activityid;
    }

    public void setActivityid(Long activityid) {
        this.activityid = activityid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getActivityname() {
        return activityname;
    }

    public void setActivityname(String activityname) {
        this.activityname = activityname;
    }

    public String getActivitytype() {
        return activitytype;
    }

    public void setActivitytype(String activitytype) {
        this.activitytype = activitytype;
    }

    public LocalDate getActivitydate() {
        return activitydate;
    }

    public void setActivitydate(LocalDate activitydate) {
        this.activitydate = activitydate;
    }

    public double getTotaldurationMin() {
        return totaldurationMin;
    }

    public void setTotaldurationMin(double totaldurationMin) {
        this.totaldurationMin = totaldurationMin;
    }

    public double getTotaldistanceMet() {
        return totaldistanceMet;
    }

    public void setTotaldistanceMet(double totaldistanceMet) {
        this.totaldistanceMet = totaldistanceMet;
    }

    public double getAveragespeedkmh() {
        return averagespeedkmh;
    }

    public void setAveragespeedkmh(double averagespeedkmh) {
        this.averagespeedkmh = averagespeedkmh;
    }

    public double getAltitudemeters() {
        return altitudemeters;
    }

    public void setAltitudemeters(double altitudemeters) {
        this.altitudemeters = altitudemeters;
    }

    public Integer getCalorieconsumoption() {
        return calorieconsumoption;
    }

    public void setCalorieconsumoption(Integer calorieconsumoption) {
        this.calorieconsumoption = calorieconsumoption;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public List<String> getLikes() {
        return likes;
    }

    public void setLikes(List<String> likes) {
        this.likes = likes;
    }

    // Überschreibt die toString()-Methode
    @Override
    public String toString() {
        return "Activity{" +
                "activityid=" + activityid +
                ", username='" + username + '\'' +
                ", activityname='" + activityname + '\'' +
                ", activitytype='" + activitytype + '\'' +
                ", activitydate=" + activitydate +
                ", totaldurationMin=" + totaldurationMin +
                ", totaldistanceMet=" + totaldistanceMet +
                ", averagespeedkmh=" + averagespeedkmh +
                ", altitudemeters=" + altitudemeters +
                ", calorieconsumoption=" + calorieconsumoption +
                ", visibility='" + visibility + '\'' +
                ", likes=" + likes +
                '}';
    }

    // **ListToStringConverter**
    @Converter
    public static class ListToStringConverter implements AttributeConverter<List<String>, String> {
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            try {
                return (attribute == null || attribute.isEmpty()) ? "[]" : objectMapper.writeValueAsString(attribute);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Error converting list to JSON", e);
            }
        }

        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try {
                return (dbData == null || dbData.isEmpty()) ? new ArrayList<>() : objectMapper.readValue(dbData, new TypeReference<>() {});
            } catch (IOException e) {
                throw new IllegalArgumentException("Error converting JSON to list", e);
            }
        }
    }
}
