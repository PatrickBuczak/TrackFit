import {Component, OnInit} from '@angular/core';
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";
import {NavbarComponent} from "../navbar/navbar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Component({
  selector: 'app-leaderboard-admin',
  standalone: true,
  imports: [
    NavbarAdminComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './leaderboard-admin.component.html',
  styleUrl: './leaderboard-admin.component.scss'
})
export class LeaderboardAdminComponent implements OnInit {


  searchText: string = '';
  logedusername: string | null = ''; //in meinem Fall wird der eingelogte Username aus dem sS gezogen. Wenn dieser aber nicht gefunden wird und folgich null ist wurde | null implementiert. Wird zwar eigentlich nicht so kommen aber dadurch gewährlseiste ich, dass der Code in allen Fällen funktioniert. Sonst ist das Aufrufen des Wertes im sS nicht möglich -> Fehler
  jwttoken: boolean = true;

  // Diese Methode wird beim Initialisieren bzw. beim navigieren auf die Komponente ( /öffnen der Komponente) aufgerufen und führt die in ihr enthaltenen Methoden aus
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.checkSession();
    this.getAllActivitys();
    //Für Aufrufe mit einer Initalisierungsreihenfolge
  }

  //Durch den Konstruktor werden die benötigten Dienste Router und HttpClient in die Komponente geladen. Damit meine ich, dass die Abhängigkeiten bei Initialisierung der Komponente bereitgestellt werden. Dadurch ist es dann möglich zwischen den Komponenten zu navigieren oder HTTP-Anfragen durchzuführen.
  constructor(private router: Router, private http: HttpClient) {
    //Hier könnte ich initiale Einstellungen bzw. Anhängigkeiten implementieren ungleich initalisierungslogiken wie in ngOnInit (richtiger Platz dafür, da Reihenfolge berücksichtigt)
  }


  checkSession() {
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe({
        next: (jwttoken) => {
          this.jwttoken = jwttoken;
          console.log('JWTToken:', this.jwttoken);
          if (this.jwttoken) {
            this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.logedusername}`).subscribe({
                next: (user) => { // stellt Sicher, dass der User zum Zeitpunkt der Anfrage noch existiert
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
                            complete: () => {
                              console.log('fertig');
                            }
                          }
                        );
                      },
                      error: (error) => {
                        console.error('Error bei der Löschung des JWTToken', error);
                      },
                      complete: () => {
                        console.log('fertig');
                      }
                    }
                  );
                },
                error: (error) => {
                  console.error('Error bei der Anfrage der Userdaten', error);
                },
                complete: () => {
                  console.log('fertig');
                }
              }
            );
          } else {
            this.router.navigate(['/']).then(() => {//durch then wird definiert, was gemacht werden soll, wenn die Navigation erfolrgreich war  (Callback) und durch catch wird ein potenzieller Fehler angezeigt.
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
        complete: () => {
          console.log('fertig');
        }
      }
    );
  }

  //=> Anchor-Arrow


  //leere Liste mit Eigenschaften für die Aktivitäten-Datensätze
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
    likeCount: number,
    likes: string[];
  }[] = [];

  getAllActivitys(): void {
    this.http.get<any[]>(`http://localhost:8080/api/v1/activity/all`).subscribe({
      next: (response) => {
        this.data = response.map(activity => ({
          ...activity,
          likeCount: activity.likes ? activity.likes.length : 0, // Anzahl der Likes
          likes: activity.likes || [] // Liste der Likes initialisieren
        }));
        this.CreateAndSaveLeaderboard();
        console.log('Aktivitätsdaten mit Likes:', this.data);
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Aktivitäten:', error);
      },
      complete: () => {
        console.log('Abruf der Aktivitäten abgeschlossen.');
      }
    });
  }

  //leere Liste mit Eigenschaften für die Leaderboard-Datensätze
  leaderboard: {
    username: string,
    activityCount: number,
    totalDurationInHours: number,
    TotalDistanceInKm: number,
    TotalCaloriesBurned: number,
    TotalAltitudeInMeters: number,
    AverageSpeedInKmh: number,
    FastestSpeedInKmh: number,
    TotalLikes: number;
  }[] = [];

  CreateAndSaveLeaderboard() {
    const userActivityData = new Map<
      string,
      {
        count: number;
        totalDurationInMin: number;
        totalDistanceInMet: number;
        totalCaloriesBurned: number;
        totalAltitudeInMeters: number;
        fastestSpeedInKmh: number;
        totalLikes: number; // Likes summieren
      }
    >();

    this.data.forEach(activity => {
      const averageSpeedInKmh = activity.totaldurationMin
        ? (activity.totaldistanceMet / 1000) / (activity.totaldurationMin / 3600)
        : 0;

      if (userActivityData.has(activity.username)) {
        const userData = userActivityData.get(activity.username)!;
        userData.count += 1;
        userData.totalDurationInMin += activity.totaldurationMin;
        userData.totalDistanceInMet += activity.totaldistanceMet;
        userData.totalCaloriesBurned += activity.calorieconsumoption;
        userData.totalAltitudeInMeters += activity.altitudemeters;
        userData.fastestSpeedInKmh = Math.max(userData.fastestSpeedInKmh, activity.averagespeedkmh);
        userData.totalLikes += activity.likeCount; // Likes summieren
      } else {
        userActivityData.set(activity.username, {
          count: 1,
          totalDurationInMin: activity.totaldurationMin,
          totalDistanceInMet: activity.totaldistanceMet,
          totalCaloriesBurned: activity.calorieconsumoption,
          totalAltitudeInMeters: activity.altitudemeters,
          fastestSpeedInKmh: activity.averagespeedkmh,
          totalLikes: activity.likeCount // Likes initialisieren
        });
      }
    });

    userActivityData.forEach((data, username) => {
      this.leaderboard.push({
        username,
        activityCount: data.count,
        totalDurationInHours: parseFloat((data.totalDurationInMin / 3600).toFixed(2)),
        TotalDistanceInKm: parseFloat((data.totalDistanceInMet / 1000).toFixed(2)),
        TotalCaloriesBurned: parseFloat(data.totalCaloriesBurned.toFixed(2)),
        TotalAltitudeInMeters: parseFloat(data.totalAltitudeInMeters.toFixed(2)),
        AverageSpeedInKmh: parseFloat(((data.totalDistanceInMet / 1000) / (data.totalDurationInMin / 3600)).toFixed(2)),
        FastestSpeedInKmh: parseFloat(data.fastestSpeedInKmh.toFixed(2)),
        TotalLikes: data.totalLikes // Likes hinzufügen
      });
    });

    this.leaderboard.sort((a, b) => b.activityCount - a.activityCount);
  }


  filteredData() {
    // Filtert die Daten in der leaderboardliste basierend auf dem Suchtext. Es werden nur Elenente der Liste Ausgegeben, die den Suchtext beinhalten, wenn nicht leer!
    //.filter ... durchläuft dabei jedes Element. .toLowerCase() wandelt den entsprcehenden Inhalt in kleinbuchstaben um, zu vergleichbarkeit
    return this.leaderboard.filter(item => item.username.toLowerCase().includes(this.searchText.toLowerCase())); //Name wird in Kleinbuchstaben umgewandelt
    //Die berücksichtigen Elemente werden in item geladen - eine gefilterte Liste wird zurückgegeben.
  }

  sortDirection: boolean = false; // true für von unten nach oben aufsteigend - initial
  //angegebene Spalte wird sortiert. Im Prinzip wird dabei ein id für die Spaltenberezichnungen festgelegt.
  sortData(column: 'username' | 'activityCount' | 'totalDurationInHours' | 'TotalDistanceInKm' | 'TotalCaloriesBurned' | 'TotalAltitudeInMeters' | 'AverageSpeedInKmh' | 'FastestSpeedInKmh' | 'TotalLikes') {
    this.sortDirection = !this.sortDirection; //Stoßrichtung der Sotierung wird umgekehrt. true für von unten nach oben aufsteigend <-> false für von unten nach oben absteigend
    //.sort sortiert die Liste gemäß der angeebenen Spalte
    this.leaderboard.sort((a, b) => {// a und b sind zwei Elemente der entsprechenden Spalte die verglichen werden.
      if (this.sortDirection) {//Aufsteigende Sortierung, wenn sortDirection = true
        return a[column] > b[column] ? 1 : -1;
        // Wenn a größer als b ist, wird 1 zurückgegeben und die Tabelle aufsteigend (von unten nach oben) sortiert. Ist dem nicht so wird -1 zurückgegeben und die Tabelle bleibt aufsteigend sortiert.
      } else {//Absteigende Sortierung, sonst bzw. wenn sortDirection = false
        return a[column] < b[column] ? 1 : -1;
        // Wenn a kleiner als b ist, wird 1 zurückgegeben und die Tabelle absteigend (von unten nach oben) sortiert. Ist dem nicht so wird -1 zurückgegeben und die Tabelle bleibt absteigend sortiert.
      }
    });
  }


  getPlatz(index: number): number {
    return this.sortDirection ? this.filteredData().length - index : index + 1;
  }

}
