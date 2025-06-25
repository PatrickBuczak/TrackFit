import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { NavbarAdminComponent } from "../navbar-admin/navbar-admin.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from "@angular/forms";
import { CommonModule, DecimalPipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    NavbarAdminComponent,
    NavbarComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './activity-repository.component.html',
  styleUrls: ['./activity-repository.component.scss']
})
export class ActivityRepositoryComponent implements OnInit {

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername: string | null = '';
  jwttoken: boolean = true;

  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.getActivitiesByUsername().then(() => {
      this.loadLikesForActivities();
    });
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................

  constructor(private router: Router, private http: HttpClient) {}

  //---Filter JWTToken Check............................
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
  //---Filter JWTToken Check............................

  ActivityCount: number = 0;
  TotalDurationInHours: number = 0;
  TotalDistanceInKm: number = 0;
  TotalCaloriesBurned: number = 0;
  TotalAltitudeInMeters: number = 0;
  AverageSpeedInKmh: number = 0;
  searchText: string = '';
  sortDirection: boolean = true; // true für ascending, false für descending
  data: {
    activityid: number,
    username: string,
    activityname: string,
    activitytype: string,
    activitydate: string,
    totaldurationMin: number,
    totaldistanceMet: number,
    averagespeedkmh: number,
    altitudemeters: number,
    calorieconsumoption: number,
    visibility: string,
    likes: string[]; //liste der Nutzer, die geliked haben
    likeCount: number; //Anzahl Likes
  }[] = [];


  // Aktivitätsdaten abrufen
  getActivitiesByUsername(): Promise<void> {
    return new Promise((resolve, reject) => {
      // HTTP GET-Anfrage, um alle Aktivitäten eines Benutzers basierend auf dem Benutzernamen abzurufen
      this.http.get<any[]>(`http://localhost:8080/api/v1/activity/by-username?username=${this.logedusername}`).subscribe(
        // Erfolgreiches Abrufen der Aktivitäten
        (response) => {
          // Verarbeitung der empfangenen Aktivitäten
          this.data = response.map(activity => ({
            ...activity,      // Kopiert alle ursprünglichen Eigenschaften der Aktivität
            likes: [],        // Initialisiert die Liste der Likes als leer
            likeCount: 0      // Initialisiert die Anzahl der Likes auf 0
          }));
          resolve(); // Beendet das Promise erfolgreich
        },
        // Fehlerbehandlung, falls die Anfrage fehlschlägt
        (error) => {
          console.error('Fehler beim Abrufen der Aktivitäten:', error);
          reject(error); // Beendet das Promise mit einem Fehler
        }
      );
    });
  }

  // Likes für alle Aktivitäten abrufen und in die Liste integrieren
  loadLikesForActivities(): void {
    // Iteriere über alle Aktivitäten in der Datenstruktur
    this.data.forEach(activity => {
      // HTTP GET-Anfrage, um die Liste der Benutzer abzurufen, die die Aktivität geliked haben
      this.http.get<string[]>(`http://localhost:8080/api/v1/activity/${activity.activityid}/likes`).subscribe({
        // Erfolgreicher Abruf der Likes
        next: (likes) => {
          activity.likes = likes; // Speichere die Liste der Benutzer, die die Aktivität geliked haben
          activity.likeCount = likes.length; // Speichere die Anzahl der Likes für diese Aktivität
        },
        // Fehlerbehandlung, falls die Anfrage fehlschlägt
        error: (error) => {
          console.error(`Fehler beim Abrufen der Likes für Aktivität ${activity.activityid}:`, error);
        }
      });
    });
  }


  // Navigiert zur Map-Visualisierung
  navigateToMap(activityId: number): void {
    this.router.navigate(['/map-view', activityId]);
  }

  // Navigiert zur Elevation-Visualisierung
  navigateToElevation(activityId: number): void {
    this.router.navigate(['/elevation-visualization', activityId]);
  }

  //Filtert sich die Sachen aus der Datei raus
  filteredData() {
    return this.data.filter(item => item.activityname.toLowerCase().includes(this.searchText.toLowerCase())); //Name wird in Kleinbuchstaben umgewandelt
  }

  //Sortiert die Liste um
  sortData(column: 'activityid' | 'activityname' | 'activitytype' | 'activitydate' | 'totaldurationMin' | 'totaldistanceMet' | 'averagespeedkmh' | 'altitudemeters' | 'calorieconsumoption' | 'visibility' | 'likeCount') {
    this.sortDirection = !this.sortDirection;
    this.data.sort((a, b) => {
      if (this.sortDirection) {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
  }


}
