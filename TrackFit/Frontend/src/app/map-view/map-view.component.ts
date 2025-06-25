import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import { Router } from '@angular/router';
import L, {polyline} from 'leaflet';
import {forkJoin} from "rxjs";
import {Location, NgForOf, NgIf} from '@angular/common';

const defaultIcon = L.icon({
  iconUrl: 'http://localhost:4200/assets/marker-icon-blue.png',
  iconRetinaUrl: 'http://localhost:4200/assets/marker-icon-2x.png',
  shadowUrl: 'http://localhost:4200/assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent implements OnInit{
  constructor(private route: ActivatedRoute,private http:HttpClient,private router: Router, private location: Location) {}
  activityId: number | null = null;
  activityName: string = '';
  activityDate: string = '';
  logedusername: string | null = '';
  jwttoken: boolean = true;
  likesCount: number = 0; // Speichert die Anzahl der Likes einer Aktivität


  ngOnInit() {
    this.logedusername = sessionStorage.getItem('username');

    // Hole die Aktivitäts-ID aus der URL
    const activityId = this.route.snapshot.paramMap.get('activityid');
    if (activityId) {
      this.activityId = Number(activityId);

      // Rufe die Methode auf, um die Aktivitätsdetails zu laden
      this.loadActivityDetails(this.activityId);

      this.loadLikes(this.activityId);

      // Rufe die Koordinaten ab und zeige die Karte
      this.fetchCoordinatesAndDisplayMap(this.activityId);
    }
  }

  loadLikes(activityId: number): void {
    // URL zum Abrufen der Likes für eine bestimmte Aktivität
    const likesUrl = `http://localhost:8080/api/v1/activity/${activityId}/likes`;

    // HTTP GET-Anfrage, um die Likes der Aktivität abzurufen
    this.http.get<string[]>(likesUrl).subscribe({
      // Erfolgreicher Abruf der Likes
      next: (likes) => {
        this.likesCount = likes.length; // Speichere die Anzahl der Likes in `likesCount`
      },
      // Fehlerbehandlung für den Fall, dass die Anfrage fehlschlägt
      error: (error) => {
        console.error(`Fehler beim Laden der Likes für Aktivität ${activityId}:`, error);
      },
      // Wird ausgeführt, wenn der Abruf der Likes abgeschlossen ist
      complete: () => {
        console.log('Likes erfolgreich geladen.');
      }
    });
  }

  fetchCoordinatesAndDisplayMap(activityid: number) {
    const detailsRequest = this.http.get<{
      activityname: string,
      activitytype: string,
      totaldurationMin: number,
      totaldistanceMet: number,
      averagespeedkmh: number,
      altitudemeters: number,
      calorieconsumoption: number
    }>(`http://localhost:8080/api/v1/activity/${activityid}`);

    // Anfrage 2: Koordinaten
    const coordinatesRequest = this.http.get<{ lat: number; lon: number }[]>(
      `http://localhost:8080/api/v1/activitytrack/${activityid}/coordinates`
    );

    // Beide Anfragen parallel ausführen
    forkJoin([detailsRequest, coordinatesRequest]).subscribe(
      ([details, coordinates]) => {


        if (!coordinates || coordinates.length === 0) {
          console.error('Keine Koordinaten gefunden');
          return;
        }

        this.displayMap(coordinates, details);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    );
  }


  displayMap(coordinates: { lat: number; lon: number }[], details: {activityname: string; activitytype: string; totaldurationMin: number; totaldistanceMet: number; averagespeedkmh: number; altitudemeters: number; calorieconsumoption: number;}) {
    if (coordinates.length === 0) {
      console.error('Keine Koordinaten gefunden');
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map-Container nicht gefunden!');
      return;
    }

    if (document.getElementById('map')?.hasChildNodes()) {
      document.getElementById('map')!.innerHTML = ''; // Bereinigt den Container
    }
    const map = L.map('map').setView([coordinates[0].lat, coordinates[0].lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    const latlngs: [number, number][] = coordinates.map(coord => [coord.lat, coord.lon]);

    const polyline= L.polyline(latlngs, { color: 'blue', weight:4 }).addTo(map);

    L.marker(latlngs[0]).addTo(map); // Marker am Startpunkt
    L.marker(latlngs[latlngs.length - 1]).addTo(map);

    const popupContent = `
  <div style="font-family: Arial, sans-serif; text-align: center; color: #12142B">
    <h3>${details.activityname}</h3>
    <p>
      <strong>Typ:</strong> ${details.activitytype}<br>
      <strong>Gesamtdauer:</strong> ${details.totaldurationMin} sec<br>
      <strong>Distanz:</strong> ${(details.totaldistanceMet / 1000).toFixed(2)} km<br>
      <strong>Geschwindigkeit:</strong> ${details.averagespeedkmh.toFixed(2)} km/h<br>
      <strong>Höhenmeter:</strong> ${(details.altitudemeters).toFixed(2)} m<br>
      <strong>Kalorienverbrauch:</strong> ${details.calorieconsumoption} kcal<br>
      <strong>Likes:</strong> ${this.likesCount}<br> <!-- Anzeige der Anzahl der Likes in der Benutzerschnittstelle -->
    </p>
  </div>
`;

    polyline.bindPopup(popupContent);


    polyline.on('mouseover',(e: L.LeafletMouseEvent) => {
      polyline.openPopup(e.latlng);
    });

    polyline.on('mouseout',(e:L.LeafletMouseEvent)=>{
      polyline.closePopup();
    });

    polyline.on('click',(e:L.LeafletMouseEvent)=>{
      polyline.openPopup(e.latlng);
    });


    map.fitBounds(latlngs);

    setTimeout(() => {
      map.invalidateSize(true);
    }, 0);
  }


  // ACTIVITY-DETAILS FÜR DIE ÜBERSCHRIFT (OBERHALB DER MAP):

  // Methode zum Laden der Aktivitätsinformationen aus dem Backend
  loadActivityDetails(activityId: number): void {
    const url = `http://localhost:8080/api/v1/activity/${activityId}`;
    this.http.get<{
      activityname: string;
      activitydate: string;
    }>(url).subscribe({
      next: (activity) => {
        this.activityName = activity.activityname;
        this.activityDate = this.formatDate(activity.activitydate);

        // Lade die Likes für die Aktivität
        this.loadLikes(activityId);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aktivitätsdetails:', error);
      },
      complete: () => {
        console.log('Aktivitätsdetails erfolgreich geladen.');
      }
    });
  }


// Methode zum Umwandeln des Datumformats
  formatDate(dateString: string): string {
    // Datum im Format dd.mm.yyyy umwandeln
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }




  // ALTE FUNKTIONEN WIE JWT TOKEN CHECK UND RETURN-BUTTON

  // --- RETURN BUTTON FUNKTION ---
  // editiert, um nicht auf eine feste URL zurückzugehen, sondern mittels location auf die zuvor aufgerufene URL---
  navrole: boolean = false; // Variable zur Speicherung der Benutzerrolle: true = regulär, false = Admin
  backnavigate() {
    // Prüfen, ob die letzte Route in der History existiert
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
