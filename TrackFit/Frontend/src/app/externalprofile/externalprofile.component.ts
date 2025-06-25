import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule, NgForOf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Location } from '@angular/common';
import { AchievementsComponent } from "../achievements/achievements.component";


@Component({
  selector: 'app-externalprofile',
  standalone: true,
  imports: [
    NavbarComponent,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    CommonModule,
    AchievementsComponent
  ],
  templateUrl: './externalprofile.component.html',
  styleUrl: './externalprofile.component.scss'
})
export class ExternalprofileComponent implements OnInit {

  logedusername: string | null = '';
  externprofile: string | null = '';
  friends: string[] = [];
  visibility: string | null = '';
  TotalLikes: number = 0; // Gesamte Anzahl der Likes, die der Benutzer für alle Aktivitäten erhalten hat

  constructor(private router: Router, private http: HttpClient, private location: Location) {}

  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.externprofile = sessionStorage.getItem('externalprofile');
    this.getUserByUsername();
    this.getActivitiesByUsername().then(() => {
      this.loadLikes();
    });
    this.updateUserRole();
    this.loadFriendsOfUser();
    this.checkSession();
  }


  loadLikes(): void {
    this.TotalLikes = 0; // Gesamtsumme aller Likes zurücksetzen

    if (this.data.length > 0) {
      // Iteriere über alle Aktivitäten und lade die Likes für jede Aktivität
      this.data.forEach(activity => {
        this.http.get<string[]>(`http://localhost:8080/api/v1/activity/${activity.activityid}/likes`).subscribe({
          // Erfolgreicher Abruf der Likes
          next: (likes) => {
            activity.likes = likes; // Speichere die Liste der Benutzer, die die Aktivität geliked haben
            activity.userHasLiked = likes.includes(this.logedusername || ''); // Prüfe, ob der eingeloggte Benutzer die Aktivität geliked hat
            activity.likeCount = likes.length; // Aktualisiere die Anzahl der Likes für die Aktivität
            this.TotalLikes += likes.length; // Addiere die Likes der Aktivität zur Gesamtsumme
          },
          // Fehlerbehandlung, falls der Abruf fehlschlägt
          error: (error) => {
            console.error(`Fehler beim Abrufen der Likes für Aktivität ${activity.activityid}:`, error);
          }
        });
      });
    }
  }

  toggleLikes(activity: any): void {
    // Überprüft, ob der Benutzer die Aktivität bereits geliked hat
    const userAlreadyLiked = activity.likes.includes(this.logedusername || '');

    // URL für das Liken einer Aktivität
    const likeUrl = `http://localhost:8080/api/v1/activity/${activity.activityid}/like?username=${this.logedusername}`;

    // URL für das Entfernen eines Likes von einer Aktivität
    const unlikeUrl = `http://localhost:8080/api/v1/activity/${activity.activityid}/unlike?username=${this.logedusername}`;

    // Verhindert das Liken der eigenen Aktivität
    if (activity.username === this.logedusername) {
      alert("Du kannst deine eigene Aktivität nicht liken."); // Hinweis an den Benutzer
      return; // Vorgang abbrechen
    }

    if (userAlreadyLiked) {
      // Benutzer hat die Aktivität bereits geliked: Entferne den Like
      this.http.delete(unlikeUrl, { responseType: 'text' }).subscribe({
        // Erfolgreiches Entfernen des Likes
        next: (response) => {
          activity.likes = activity.likes.filter((user: string) => user !== this.logedusername); // Entfernt den Benutzer aus der Like-Liste
          activity.userHasLiked = false; // Aktualisiert den Like-Status auf "nicht geliked"
          activity.likeCount = activity.likes.length; // Aktualisiert die Like-Anzahl
          console.log(`Benutzer ${this.logedusername} hat Aktivität ${activity.activityid} entliked.`);
        },
        // Fehler beim Entfernen des Likes
        error: (error) => {
          console.error('Fehler beim Entfernen des Likes:', error);
        }
      });
    } else {
      // Benutzer hat die Aktivität noch nicht geliked: Füge den Like hinzu
      this.http.post(likeUrl, {}, { responseType: 'text' }).subscribe({
        // Erfolgreiches Hinzufügen des Likes
        next: (response) => {
          activity.likes.push(this.logedusername || ''); // Fügt den Benutzer zur Like-Liste hinzu
          activity.userHasLiked = true; // Aktualisiert den Like-Status auf "geliked"
          activity.likeCount = activity.likes.length; // Aktualisiert die Like-Anzahl
          console.log(`Benutzer ${this.logedusername} hat Aktivität ${activity.activityid} geliked.`);
        },
        // Fehler beim Hinzufügen des Likes
        error: (error) => {
          console.error('Fehler beim Hinzufügen des Likes:', error);
        }
      });
    }
  }

  // Variable zur Speicherung des JWT-Token-Status:
  // true: JWT-Token ist gültig, die Sitzung ist aktiv
  // false: JWT-Token ist ungültig/ abgelaufen, Benutzer muss sich neu anmelden
  jwttoken: boolean = true;




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



  // --- Zurück-Navigation basierend auf der Benutzerrolle ---
  navrole:boolean=false; // Variable zur Speicherung der Benutzerrolle: true = regulär, false = Admin
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
  //---Navigate back............................



  // Variable speichert Daten des Benutzers, dessen Profil angezeigt wird
  // Werte werden aus Backend geladen und in Benutzeroberfläche angezeigt
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
  getUserByUsername(): void {
    // Überprüfung des JWT-Tokens für aktuell angemeldeten Benutzer
    // Wenn Token gültig ist, können Benutzerinformationen abgerufen werden
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe(
      (jwttoken) => {
        // Token-Status speichern
        this.jwttoken = jwttoken;
        console.log('JWTToken:', this.jwttoken);
        if (this.jwttoken) {
          // HTTP-Anfrage zum Abrufen der Benutzerinformationen des externen Profils
          this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.externprofile}`).subscribe(
            (user) => {

              // Benutzerinformationen in die `userLoad`-Variable übertragen
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

              // Profilbild im HTML-Element aktualisieren
              const imgElement = document.getElementById('profilbild') as HTMLImageElement;
              imgElement.src = this.userLoad.profilepicture;
              //Hier die Funktion
            },
            (error) => {
              // Fehler beim Abrufen der Benutzerinformationen
              console.error('Error fetching user', error);
            }
          );
        } else {
          // Falls Token ungültig, zur Login-Seite navigieren und Benutzer informieren
          this.router.navigate(['/']).then(() => {
            console.log('Navigated to /website-admin');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
          alert('Ihre Sitzung ist bereits abgelaufen! Melden Sie sich erneut an.');
        }
      },
      (error) => {
        // Fehler bei der Überprüfung des JWT-Tokens
        console.error('Error checking JWTToken', error);
      }
    );
  }
  //---Userdata show............................


  // --- Variablen für Aktivitäten-Statistiken ---
  ActivityCount:number=0;
  TotalDurationInHours:number=0;
  TotalDistanceInKm:number=0;
  TotalCaloriesBurned:number=0;
  TotalAltitudeInMeters:number=0;
  AverageSpeedInKmh:number=0;
  // Suchtext zur Filterung von Aktivitäten (vom Benutzer eingegeben)
  searchText: string = '';
  // true für ascending, false für descending
  sortDirection: boolean = true;
  // Datenstruktur für die Liste der Aktivitäten
  data: {
    likeCount: number;
    activityid: number, username: string, activityname: string, activitytype: string, activitydate: string, totaldurationMin: number, totaldistanceMet: number, averagespeedkmh: number, altitudemeters: number, calorieconsumoption: number, visibility: string, likes: string[], userHasLiked: boolean }[] = [];
  getActivitiesByUsername(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`http://localhost:8080/api/v1/activity/by-username?username=${this.externprofile}`).subscribe({
        next: (response) => {
          this.data = response;
          this.ActivityCount = this.data.length;
          // Statistiken berechnen
          this.TotalCaloriesBurned = parseFloat(this.data.reduce((sum, item) => sum + item.calorieconsumoption, 0).toFixed(2));
          this.TotalAltitudeInMeters = parseFloat(this.data.reduce((sum, item) => sum + item.altitudemeters, 0).toFixed(2));
          this.TotalDurationInHours = parseFloat((this.data.reduce((sum, item) => sum + item.totaldurationMin, 0) / 3600).toFixed(2));
          this.TotalDistanceInKm = parseFloat((this.data.reduce((sum, item) => sum + item.totaldistanceMet, 0) / 1000).toFixed(2));

          // Die Durchschnittsgeschwindigkeit aller Aktivitäten wird hier als tatsächliche Durchschnittsgeschwindigkeit berechnet
          // und nicht als Durchschnittsgeschwindigkeit der Durchschnittsgeschwindigkeiten
          const totalDistanceInKm = this.TotalDistanceInKm;
          const totalTimeInHours = this.TotalDurationInHours;
          this.AverageSpeedInKmh = parseFloat((totalDistanceInKm / totalTimeInHours || 0).toFixed(2));

          resolve();
        },
        error: (error) => {
          console.error('Error fetching activities:', error);
          reject(error);
        }
      });
    });
  }

  /*
  //nur reguläre Benutzer können Aktivitäten haben!
  select * from trackfit.activity;
INSERT INTO trackfit.activity (id, username, activityname, activitytype, activitydate, totalduration_min, totaldistance_met, averagespeedkmh, altitudemeters, calorieconsumption, visibility) VALUES
(23000, 'KaranG', 'Eins', 'Fahrrad', '2024-10-20', 30, 15, 30, 0, 150, 'sichtbar'),
(23001, 'KaranG', 'Zwei', 'Fahrrad', '2024-10-20', 60, 30, 30, 0, 300, 'nicht sichtbar');
delete from trackfit.activity where id=23000;
delete from trackfit.activity where id=23001;

  */

  // Methode überprüft, ob angemeldete Benutzer reguläre Rolle (true) oder Administratorrechte (false) hat.
  // Benutzerrolle wird in Variablen `navrole` gespeichert
  updateUserRole() {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${this.logedusername}`).subscribe(
      (role) => {
        // Die erhaltene Rolle wird in `navrole` gespeichert.
        this.navrole = role;
        console.log('Role updated:', this.navrole);
      },
      (error) => {
        console.error('Error checking user role', error);
      }
    );
  }

  filteredFriends(): string[] {
    if (!this.navrole) {
      // Admins (navrole === false) können alle Freunde sehen
      return this.friends;
    }

    // Reguläre Benutzer (navrole === true) sehen die Liste nur, wenn die Sichtbarkeit auf 'public' steht
    return this.visibility === 'public' ? this.friends : [];
  }

    filteredData() {
    if (this.navrole) {
      // Filter für reguläre Benutzer: nur sichtbare Aktivitäten und basierend auf Suchtext
      return this.data.filter(item =>
        item.activityname.toLowerCase().includes(this.searchText.toLowerCase()) &&
        item.visibility === 'sichtbar' ||
        (item.visibility === 'nur Freunde' && this.friends
          .map(friend => friend.trim().toLowerCase())
          .includes((this.logedusername || '').trim().toLowerCase()))
      );

    }
    // Filter für Administratoren: basierend auf Suchtext, ohne Sichtbarkeitsfilter
    return this.data.filter(item => item.activityname.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  // --- Sortierung der Aktivitäten basierend auf der Spalte und Richtung ---
  // Diese Methode sortiert Aktivitätenliste in Tabelle
  // - `column`: Die Spalte, nach der sortiert werden soll
  // - Sortierrichtung: true = aufsteigend, false = absteigend.
  sortData(column: | 'activityid' | 'activityname' | 'visibility' | 'activitytype' | 'activitydate' | 'totaldurationMin' | 'totaldistanceMet' | 'averagespeedkmh' | 'altitudemeters' | 'calorieconsumoption') {
    // Sortierrichtung umkehren (toggle zwischen aufsteigend und absteigend)
    this.sortDirection = !this.sortDirection;
    // Sortierlogik: Vergleich der Werte der ausgewählten Spalte
    this.data.sort((a, b) => {
      if (this.sortDirection) {
        // Aufsteigend sortieren
        return a[column] > b[column] ? 1 : -1;
      } else {
        // Absteigend sortieren
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


  loadFriendsOfUser(): void {
    if (this.externprofile) {
      this.http.get<string[]>(`http://localhost:8080/api/v1/friends/list?username=${this.externprofile}`).subscribe(
        (friends) => {
          this.http.get(`http://localhost:8080/api/v1/friends/visibility?username=${this.externprofile}`, {
            responseType: 'text' // Antwort als Text behandeln
          }).subscribe({
            next: (response: string) => {
              this.visibility = response.trim();

              // Sichtbarkeitsprüfung
              if (!this.navrole || this.visibility === 'public') {
                // Admins (navrole === false) können alle Freunde sehen
                this.friends = friends;
              } else {
                // Reguläre Benutzer (navrole === true) sehen die Liste nur bei 'public'
                this.friends = [];
              }
            },
            error: (error) => {
              console.error('Fehler beim Abrufen der Sichtbarkeit:', error);
              alert('Fehler beim Abrufen der Sichtbarkeit des Benutzers.');
            }
          });
        },
        (error) => {
          console.error('Fehler beim Laden der Freundesliste:', error);
          alert('Fehler beim Abrufen der Freundesliste.');
        }
      );
    } else {
      console.error('Kein externes Profil gefunden.');
    }
  }


}
