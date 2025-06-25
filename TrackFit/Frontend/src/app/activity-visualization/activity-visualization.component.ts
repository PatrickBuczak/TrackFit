import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {FormsModule} from "@angular/forms";
import {CommonModule, Location} from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-activity-visualization',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './activity-visualization.component.html',
  styleUrl: './activity-visualization.component.scss'
})
export class ActivityVisualizationComponent implements OnInit {
  logedusername :string |null=''; //Der Benutzername des aus der Session genommen wird
  selectedYear:number= new Date().getFullYear(); //Das ausgewählte Jahr
  years:number[]= []; //Liste der Jahre
  activitySummary:any[]= []; //Zusammenfassung der Aktivitäten die von API geladen werden
  chart:any; //Um Chart.Js zu speichern


  constructor( private http: HttpClient, private location: Location, private router: Router) {

  }
  jwttoken: boolean = true; //JWTTOken status speichern
  ngOnInit() {
    this.logedusername = sessionStorage.getItem('username'); //Benutzername aus session aufgerufen
    if (!this.logedusername) {
      console.error('Benutzername fehlt, LocalStorage leer!'); //falls leer wird fehler angezeigt

    }
    console.log('Initialisierter Benutzername: ', this.logedusername);
    Chart.register(...registerables); //Registrierung Chart plugins
    this.generateYearOptions(); //generiert die Liste der Jahre
    console.log('Initialisiertes Jahr:', this.selectedYear);
    this.fetchActivitySummary(); //ladet die aktivitätsdaten
  }
  generateYearOptions(): void {
    const currentYear = new Date().getFullYear(); //aktuelles Jahr
    for(let year = currentYear;year>=2020;year--){
      this.years.push(year); //Jahre hinzufügen

    }
    console.log('Generierte Jahre:', this.years);
  }
  fetchActivitySummary() : void { //Ruft die zusammenfssung vom Backend
    this.http.get<any[]>(`http://localhost:8080/api/v1/activity/activities-summary/${this.selectedYear}/${this.logedusername}`) //Ausgewähltejahr und nach  Benutzer wird von Backend aufgerufen
      .subscribe({
        next: (response) => {
          this.activitySummary = response;
          // Wenn die API-Daten erfolgreich geladen wurden, Diagramm rendern
          this.renderChart(response);

        },
        error: (error) => {
          console.error('Fehler beim Abrufen der Aktivitätsdaten:', error.message);
        },
        complete: () => {
          console.log('Aktivitätsdetails erfolgreich geladen.');
        }
      });
  }

  // Diagramm erstellen/aktualisieren
  renderChart(response: any[]): void {
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]; //Array Konstante das die Monate erhält
//Daten für die achsen und Balken
    const months = this.activitySummary.map(item => monthNames[item.month - 1]);
    const totalDurations = this.activitySummary.map(item => item.totalDuration);
    const totalDistances = this.activitySummary.map(item => item.totalDistance);
    const maxSpeeds = this.activitySummary.map(item => item.maxSpeed);
    const averageSpeeds = this.activitySummary.map(item => item.averageSpeed);
    const caloriesBurned = this.activitySummary.map(item => item.caloriesBurned);
    const totalAltitudes = this.activitySummary.map(item => item.totalAltitude);

    if (this.chart) {
      this.chart.destroy(); // Entfernt das alte Diagramm, falls es existiert
    }
//Neues diagramm erstellen
    this.chart = new Chart('activityChart', {
      type: 'bar', // Balkendiagramm
      data: {
        labels: months, //X-Achse Monate
        datasets: [
          {
            label: 'Gesamtdauer (Minuten)',
            data: totalDurations,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Gesamtdistanz (Meter)',
            data: totalDistances,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Maximale Geschwindigkeit (km/h)',
            data: maxSpeeds,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          },
          {
            label: 'Durchschnittliche Geschwindigkeit (km/h)',
            data: averageSpeeds,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Verbrannte Kalorien (kcal)',
            data: caloriesBurned,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Höhenmeter (Meter)',
            data: totalAltitudes,
            backgroundColor: 'rgba(75, 192, 75, 0.6)',
            borderColor: 'rgba(75, 192, 75, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Werte',
              color: 'white',
              font: {
                size: 18 // Schriftgröße der Werte an der y-Achse
              }
            },
            ticks: {
              color: 'white', // Schriftfarbe der Werte an der y-Achse auf Weiß setzen
              font: {
                size: 16 // Schriftgröße der Werte an der y-Achse
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Monate',
              color: 'white',
              font: {
                size: 18 // Schriftgröße der Werte an der x-Achse
              }
            },
            ticks: {
              color: 'white', // Schriftfarbe der Werte an der x-Achse auf Weiß setzen
              font: {
                size: 16 // Schriftgröße der Werte an der x-Achse
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'white', // Schriftfarbe der Legende auf Weiß setzen
              font: {
                size: 16 // Schriftgröße der Legendenbeschriftung
              }
            }
          }
        }
      }
    });
  }



  // --- RETURN BUTTON FUNKTION ---
  // editiert, um nicht auf eine feste URL zurückzugehen, sondern mittels location auf die zuvor aufgerufene URL---
  navrole: boolean = false; // Variable zur Speicherung der Benutzerrolle: true = regulär, false = Admin
  backnavigate() {
    // Prüfen, ob die letzte Route in der History existiert
    this.checkSession();
    if (window.history.length > 1) {
      this.location.back(); // Zurück zur vorherigen Seite
    } else {
      // Fallback-Logik basierend auf Benutzerrolle
      this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${this.logedusername}`).subscribe({
        next: (role) => {
          this.navrole = role;
          console.log('Role updated:', this.navrole);

          const targetRoute = this.navrole ? '/website' : '/website-admin';
          this.router.navigate([targetRoute]).then(() => {
            console.log(`Navigated to ${targetRoute}`);
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        },
        error: (error) => {
          console.error('Error checking user role', error);
        },
        complete: () => {
          console.log('Role check completed.');
        }
      });
    }
  }

  // --- SESSION CHECK MITTELS JWT-TOKEN-ABGLEICH ---
  checkSession(){
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe({
        next: (jwttoken) => {
          this.jwttoken = jwttoken;
          console.log('JWTToken:', this.jwttoken);
          if (this.jwttoken) {
            this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.logedusername}`).subscribe({
                next: (user) => {// stellt Sicher, dass der User zum Zeitpunkt der Anfrage noch existiert
                  this.http.delete(`http://localhost:8080/api/v1/jwttoken/delete?username=${this.logedusername}`).subscribe({
                      next: () => {
                        console.log('JWTToken erfolgreich gelöscht');
                        // neuer Token mit neuem Zeitstempel
                        this.http.post(`http://localhost:8080/api/v1/jwttoken/generate?username=${this.logedusername}`, {}).subscribe({
                            next: (token) => {
                              console.log('Token wurde generiert und gespeichetr:', token);
                            },
                            error: (error) => {
                              console.error('Error bei der Generierung des token', error);
                            },
                            complete: () =>{
                              console.log('fertig');
                            }
                          }
                        );
                      },
                      error: (error) => {
                        console.error('Error bei der Löschung des JWTToken', error);
                      },
                      complete:() =>{
                        console.log('fertig');
                      }
                    }
                  );
                },
                error: (error) => {
                  console.error('Error bei der Anfrage der Userdaten', error);
                },
                complete: () =>{
                  console.log('fertig');
                }
              }
            );
          } else {
            this.router.navigate(['/']).then(() => {//durch then wird definiert, was gemacht werden soll, wenn die Navigation erfolrgreich war und durch catch wird ein potenzieller Fehler angezeigt.
              console.log('Navigiert zu website-admin');
            }).catch(err => {
              console.error('Navigations error:', err);
            });
            alert('Ihre Sitzung ist bereits abgelaufen! Melden Sie sich erneut an.');
          }
        },
        error: (error) => {
          console.error('Error in checkSession()', error);
        },
        complete: () =>{
          console.log('fertig');
        }
      }
    );
  }

}
