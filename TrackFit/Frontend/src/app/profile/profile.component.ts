import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";
import {NavbarComponent} from "../navbar/navbar.component";
import {FormsModule} from "@angular/forms";
import {CommonModule, DecimalPipe} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import { AchievementsComponent } from '../achievements/achievements.component';

/* Komponentendeklaration */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    NavbarAdminComponent,
    NavbarComponent,
    FormsModule,
    CommonModule,
    AchievementsComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

/* Klassendefinition */
export class ProfileComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit

  logedusername:string | null ='';
  TotalLikes: number = 0; // Gesamtanzahl aller Likes


  /* beim Öffnen wird logedusername auf den sessionstorage-username gesetzt und dessen Userdaten und Aktivitäten abgefragt */
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.getUserByUsername();
    this.getActivitiesByUsername().then(() => {
      this.loadLikesForActivities(); // Lädt die Like-Daten für Aktivitäten
    });
    this.checkSession();
  }



  /* Konstruktor incl. Navigation und HTTP-Kommunikation*/
  constructor(private router: Router, private http: HttpClient) {
  }



  /* Logout mit Löschung des JWTTokens und anschließender Weiterleitung zur Startseite */
  jwttoken: boolean = true;

  logout(){
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe(
      (jwttoken) => {
        this.jwttoken = jwttoken;
        console.log('JWTToken:', this.jwttoken);
        if(this.jwttoken){
          this.http.delete(`http://localhost:8080/api/v1/jwttoken/delete?username=${this.logedusername}`).subscribe(
            () => {
              console.log('JWTToken deleted successfully');
              this.router.navigate(['/']).then(() => {
                console.log('Navigated to /website');
              }).catch(err => {
                console.error('Navigation error:', err);
              });
            },
            (error) => {
              console.error('Error deleting JWTToken', error);
            }
          );
        } else {
          this.router.navigate(['/']).then(() => {
            console.log('Navigated to /website');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        }
        alert('Ihr Logout war erfolgreich!');
      },
      (error) => {
        console.error('Error checking JWTToken', error);
      }
    );
  }


  /* Userdaten */
  userLoad = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    dateofbirth: '',
    bodysize:'',
    weight:'',
    gender:'',
    password: '',
    profilepicture: '',
    role: ''
  };

  /* Getter für die Userdaten gemäß Username mit Prüfung des JWT Tokens */
  getUserByUsername(): void {
          this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.logedusername}`).subscribe(
            (user) => {

              this.userLoad.profilepicture = user.profilepicture;
              this.userLoad.username = user.username;
              this.userLoad.firstname = user.firstname;
              this.userLoad.lastname = user.lastname;
              this.userLoad.email = user.email;
              this.userLoad.dateofbirth = user.dateofbirth;
              this.userLoad.gender = user.gender;
              this.userLoad.bodysize = user.bodysize;
              this.userLoad.weight = user.weight;
              console.log('User:', this.userLoad);
              const imgElement = document.getElementById('profilbild') as HTMLImageElement;
              imgElement.src = this.userLoad.profilepicture;

            },
            (error) => {
              console.error('Error fetching user', error);
            }
          );
  }




  /* JWTToken Session Check, prüft ob für den eingeloggten User ein JWT Token in der DB existiert */
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

  /* Aktivitätenzusammenfassung, Attribute */
  ActivityCount:number=0;
  TotalDurationInHours:number=0;
  TotalDistanceInKm:number=0;
  TotalCaloriesBurned:number=0;
  TotalAltitudeInMeters:number=0;
  AverageSpeedInKmh:number=0;
  searchText: string = '';
  sortDirection: boolean = true; // true für ascending, false für descending
  // Array von Objekten, das die Daten aller Aktivitäten eines Benutzers speichert
  data: {
    activityid: number;         // Eindeutige ID der Aktivität
    username: string;           // Benutzername des Erstellers der Aktivität
    activityname: string;       // Name der Aktivität
    activitytype: string;       // Typ der Aktivität (z. B. Laufen, Radfahren)
    activitydate: string;       // Datum der Aktivität (als String, z. B. "YYYY-MM-DD")
    totaldurationMin: number;   // Gesamtdauer der Aktivität in Minuten
    totaldistanceMet: number;   // Gesamtdistanz der Aktivität in Metern
    averagespeedkmh: number;    // Durchschnittsgeschwindigkeit der Aktivität in km/h
    altitudemeters: number;     // Zurückgelegte Höhenmeter während der Aktivität
    calorieconsumoption: number; // Verbrannte Kalorien während der Aktivität
    visibility: string;         // Sichtbarkeit der Aktivität (z. B. "öffentlich" oder "privat")
    likes: string[];            // Array von Benutzernamen, die die Aktivität geliked haben
    likeCount: number;          // Anzahl der Likes für die Aktivität
  }[] = [];


  /* Aktivitätenzusammenfassung, getter/datafetch für den (eingeloggten) User */

  getActivitiesByUsername(): Promise<void> {
    return new Promise((resolve, reject) => {
      // HTTP GET-Anfrage, um Aktivitäten des aktuellen Benutzers anhand des Benutzernamens abzurufen
      this.http.get<any[]>(`http://localhost:8080/api/v1/activity/by-username?username=${this.logedusername}`).subscribe(
        (response) => {
          // Verarbeitung der empfangenen Aktivitäten und Hinzufügen von Like-Daten
          this.data = response.map(activity => ({
            ...activity,
            likes: activity.likes || [], // Fallback: Wenn keine Likes vorhanden sind, wird ein leeres Array gesetzt
            likeCount: activity.likes ? activity.likes.length : 0 // Zählt die Likes der Aktivität
          }));

          // Anzahl der Aktivitäten berechnen
          this.ActivityCount = this.data.length;

          // Gesamtanzahl der verbrannten Kalorien berechnen
          this.TotalCaloriesBurned = parseFloat(
            this.data.reduce((sum, item) => sum + item.calorieconsumoption, 0).toFixed(2)
          );

          // Gesamthöhe berechnen
          this.TotalAltitudeInMeters = parseFloat(
            this.data.reduce((sum, item) => sum + item.altitudemeters, 0).toFixed(2)
          );

          // Gesamtdauer in Stunden berechnen
          this.TotalDurationInHours = parseFloat(
            (this.data.reduce((sum, item) => sum + item.totaldurationMin, 0) / 3600).toFixed(2)
          );

          // Gesamtdistanz in Kilometern berechnen
          this.TotalDistanceInKm = parseFloat(
            (this.data.reduce((sum, item) => sum + item.totaldistanceMet, 0) / 1000).toFixed(2)
          );

          // Durchschnittsgeschwindigkeit basierend auf Gesamtdistanz und Gesamtdauer berechnen
          const totalDistanceInKm = this.TotalDistanceInKm;
          const totalTimeInHours = this.TotalDurationInHours;
          this.AverageSpeedInKmh = parseFloat((totalDistanceInKm / totalTimeInHours || 0).toFixed(2));

          // Auflösen des Promises bei erfolgreicher Verarbeitung der Aktivitäten
          resolve();
        },
        (error) => {
          // Fehlerprotokollierung und Ablehnung des Promises bei einem Fehler
          console.error('Fehler beim Abrufen der Aktivitäten:', error);
          reject(error);
        }
      );
    });
  }

  /* Filterfunktion gemäß Aktivitätsname */
  filteredData() {
    return this.data.filter(item => item.activityname.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  /* Sortierfunktion der jeweiligen Spalten auf- und absteigend */
  sortData(column: | 'activityid' | 'activityname' | 'visibility' | 'activitytype' | 'activitydate' | 'totaldurationMin' | 'totaldistanceMet' | 'averagespeedkmh' | 'altitudemeters' | 'calorieconsumoption') {
    this.sortDirection = !this.sortDirection;
    this.data.sort((a, b) => {
      if (this.sortDirection) {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
  }

  navigateToMap(activityId: number): void {
    this.router.navigate(['/map-view', activityId]);
  }

  // Navigiert zur Elevation-Visualisierung
  navigateToElevation(activityId: number): void {
    this.router.navigate(['/elevation-visualization', activityId]);
  }

  loadLikesForActivities(): void {
    this.TotalLikes = 0; // Setze die Gesamtsumme aller Likes auf 0 zurück

    // Iteriere durch alle Aktivitäten, um die Likes für jede Aktivität abzurufen
    this.data.forEach(activity => {
      this.http.get<string[]>(`http://localhost:8080/api/v1/activity/${activity.activityid}/likes`).subscribe({
        // Erfolgreicher Abruf der Likes
        next: (likes) => {
          activity.likes = likes; // Speichere die Liste der Benutzernamen, die die Aktivität geliked haben
          activity.likeCount = likes.length; // Aktualisiere die Anzahl der Likes für die Aktivität

          // Addiere die Likes der aktuellen Aktivität zur Gesamtsumme
          this.TotalLikes += likes.length;
        },
        // Fehlerbehandlung, falls der Abruf der Likes fehlschlägt
        error: (error) => {
          console.error(`Fehler beim Abrufen der Likes für Aktivität ${activity.activityid}:`, error);
        }
      });
    });
  }

  navigateToActivityVisualization() {
    this.router.navigate(['/activity-visualization']);
  }



}

