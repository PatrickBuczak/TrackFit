import {Component, OnInit} from '@angular/core';
import {CommonModule, NgForOf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavbarComponent} from "../navbar/navbar.component";
import {Router, RouterLink} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-profilesearch',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NavbarComponent,
    FormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './profilesearch.component.html',
  styleUrl: './profilesearch.component.scss'
})
export class ProfilesearchComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername:string | null =''; // Speichert Benutzernamen des aktuell angemeldeten Benutzers
  blockCount: number = 1; //Startwert für Anzahl der 8*8 Blöcke für die gelisteten User
  ngOnInit(): void {
    // aktuell eingeloggten Benutzernamen aus Session Storage abrufen
    // Benutzerdaten zu laden oder Berechtigungen prüfen
    this.logedusername = sessionStorage.getItem('username');
    // Abrufen der Liste aller Benutzernamen (z. B. für die Such- oder Filterfunktion)
    this.getUsernames();
    this.checkSession();
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................



  // Dependency Injection:
  // `Router`: Ermöglicht Navigation zwischen verschiedenen Seiten/Komponenten der Anwendung.
  // `HttpClient`: Ermöglicht Kommunikation mit dem Backend.
  constructor(private router: Router, private http: HttpClient) {
  }


  // Variable speichert Status des aktuellen JWT-Tokens:
  // - `true`: Token ist gültig, Sitzung ist aktiv.
  // - `false`: Token ist ungültig/abgelaufen, Benutzer muss sich neu anmelden.
  jwttoken: boolean = true;





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

  // --- Variablen zur Steuerung der Benutzersuche und -sortierung ---
  searchText: string = ''; // Suchtext zur Filterung der Benutzernamen
  sortDirection: boolean = true; // true for ascending, false for descending

  // --- Datenstruktur für die Benutzerliste ---
  // Speichert Liste der Benutzernamen in Form eines Arrays von Objekten
  // Jedes Objekt enthält einen einzelnen Benutzernamen als Attribut `username`
  data: { username:string }[] = [];
  getUsernames(){
    // HTTP-Anfrage an Backend, um Liste von Benutzernamen abzurufen
    // `excludeUsername` wird genutzt, um aktuell angemeldeten Benutzer aus Liste auszuschließen
      this.http.get<string[]>(`http://localhost:8080/api/v1/user/usernames?excludeUsername=${this.logedusername}`).subscribe(
        (usernames) => {
          // Erfolgreiches Abrufen der Benutzernamen:
          // Konvertiert die Liste von Strings in eine Liste von Objekten mit der Struktur `{ username: string }`.
          this.data = usernames.map(username => ({ username }));
          console.log('Usernames:', this.data);
        },
        (error) => {
          console.error('Error fetching usernames:', error);
        }
      );
  }




  filteredData() {
    // Filtert Benutzerdaten:
    // Überprüft, ob Benutzername (in Kleinbuchstaben) den eingegebenen Suchtext enthält
    return this.data.filter(item => item.username.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  sortData(column: 'username' ) {
    this.sortDirection = !this.sortDirection;
    this.data.sort((a, b) => {
      if (this.sortDirection) {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
  }

  //---RoleCheck...........................................................
  //reguläre Rolle (true) oder eine Admin-Rolle (false)
  role: boolean = false;
  navigate(username: string) {
    // Überprüft die Rolle des angegebenen Benutzernamens.
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${username}`).subscribe(
      (role) => {
        // Speichert zurückgegebene Benutzerrolle in Variablen `role`.
        this.role = role;
        // Benutzername wird im `sessionStorage` gespeichert, damit auf anderen Seiten zugänglich ist
        sessionStorage.setItem('externalprofile', username);
        // Debugging: Ausgabe der aktualisierten Rolle in der Konsole
        console.log('Role updated:', this.role);
        if (this.role) {
          // Wenn Benutzer reguläre Rolle hat, navigiert zur regulären Profilseite
          this.router.navigate(['/externalprofile']).then(() => {
            console.log('Navigated to /website');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        } else {
          // Wenn Benutzer Admin-Rolle hat, navigiert zur Admin-Profilseite
          this.router.navigate(['/externalprofile-admin']).then(() => {
            console.log('Navigated to /website-admin');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        }
      },
      (error) => {
        console.error('Error checking user role', error);
      }
    );
  }

  // --- Methode zur Berechnung der Anzahl der benötigten Blöcke ---
  // Anzahl der Blöcke dynamisch basierend auf der Anzahl der gelisteten Benutzer berechnet.
  // Jeder Block enthält maximal 8 x 8 = 64 Benutzer.
 updateBlockCount(dataLength: number = this.data.length) {
   // Rundet Gesamtzahl der Benutzer nach oben, um Anzahl der Blöcke zu bestimmen
   // Beispiel: Bei 130 Benutzern ergibt `Math.ceil(130 / 64)` = 3 Blöcke
    this.blockCount = Math.ceil(dataLength / 64);
  }
  //---RoleCheck...........................................................
}
