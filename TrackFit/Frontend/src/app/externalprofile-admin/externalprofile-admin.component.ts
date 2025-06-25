import {Component, OnInit} from '@angular/core';
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";
import {Router, RouterLink} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import { Location } from '@angular/common';

@Component({
  selector: 'app-externalprofile-admin',
  standalone: true,
    imports: [
        NavbarAdminComponent,
        RouterLink,
      FormsModule,
      CommonModule
    ],
  templateUrl: './externalprofile-admin.component.html',
  styleUrl: './externalprofile-admin.component.scss'
})
export class ExternalprofileAdminComponent implements OnInit{

  // --- Variablen zur Speicherung von Benutzerdaten ---
  // Benutzername des aktuell angemeldeten Benutzers (aus Session Storage)
  // Benutzername des externen Profils, das angezeigt werden soll (aus Session Storage)
  logedusername:string | null ='';
  externprofile:string | null ='';
  friends: string[] = [];
  visibility: string | null ='';
  // --- Initialisierungsmethode (wird beim Laden der Komponente aufgerufen) ---
  ngOnInit(): void {
    // Benutzernamen des angemeldeten Benutzers aus Session Storage abrufen
    this.logedusername = sessionStorage.getItem('username');
    // Benutzernamen des externen Profils aus Session Storage abrufen
    this.externprofile = sessionStorage.getItem('externalprofile');
    // Benutzerinformationen des externen Profils aus Backend laden
    this.getUserByUsername();
    this.loadFriendsOfUser();
    this.checkSession();
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................



  // Dependency Injection des Angular Routers:
  // Ermöglicht Navigation zwischen verschiedenen Seiten der Anwendung
  // Dependency Injection des HttpClient:
  // Ermöglicht Senden von HTTP-Anfragen an Backend, Abrufen/ löschen / Kommunikation mit APIs.
  constructor(private router: Router, private http: HttpClient, private location: Location) {
  }


  // `jwttoken` speichert den Status des aktuellen JWT-Tokens:
  // - true: JWT-Token ist gültig, Sitzung ist aktiv.
  // - false: JWT-Token ist ungültig oder abgelaufen.
  // Variable, um Sitzung zu validieren, bei Bedarf Benutzer abzumelden/ Token erneuern.
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



  //---Navigate back............................
  // Variable zur Speicherung der Benutzerrolle:
  // - true: regulärer Benutzer
  // - false: Administrator
  navrole:boolean=true;
  backnavigate() {
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


// Diese Variable speichert die Benutzerinformationen eines Administrators oder
// eines anderen Benutzers, deren Daten angezeigt werden sollen.
// Die Werte werden dynamisch aus dem Backend geladen und genutzt, um
// die Benutzeroberfläche entsprechend zu füllen
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
    // HTTP-Anfrage an Backend, um Status des JWT-Tokens für angemeldeten Benutzer zu überprüfen
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe(
      (jwttoken) => {
        // Speichern Token-Status in Variable `jwttoken`.
        this.jwttoken = jwttoken;
        console.log('JWTToken:', this.jwttoken);
        if (this.jwttoken) {
          // Wenn Token gültig ist, wird HTTP-Anfrage gesendet, um Daten des Benutzers mit Namen `externprofile` abzurufen
          this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.externprofile}`).subscribe(
            (user) => {
              // Benutzerinformationen in `userLoad`-Variable speichern
              this.userLoad.profilepicture = user.profilepicture;
              this.userLoad.username = user.username;
              this.userLoad.firstname = user.firstname;
              this.userLoad.lastname = user.lastname;
              this.userLoad.email = user.email;
              // Ausgabe der Benutzerdaten in der Konsole (zur Überprüfung).
              console.log('User:', this.userLoad);

              // Profilbild in Benutzeroberfläche aktualisieren
              const imgElement = document.getElementById('profilbild') as HTMLImageElement;
              imgElement.src = this.userLoad.profilepicture;
              // Hier die Funktion
            },
            (error) => {
              console.error('Error fetching user', error);
            }
          );
        } else {
          // Wenn Token ungültig : Weiterleitung zur Login-Seite und Benachrichtigung des Benutzers.
          this.router.navigate(['/']).then(() => {
            console.log('Navigated to /website-admin');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
          alert('Ihre Sitzung ist bereits abgelaufen! Melden Sie sich erneut an.');
        }
      },
      (error) => {
        console.error('Error checking JWTToken', error);
      }
    );
  }
  //---Vorlage für Abfragen nach Login, dafür ne kleine funktion zum anzeigen der Userdaten eines Admins geschrieben............................


  filteredFriends(): string[] {
    if (!this.navrole) {
      // Admins (navrole === false) können alle Freunde sehen
      return this.friends;
    }

    // Reguläre Benutzer (navrole === true) sehen die Liste nur, wenn die Sichtbarkeit auf 'public' steht
    return this.visibility === 'public' ? this.friends : [];
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



  //Achtung! in der OnInit darf nicht auch noch die Token Löschung und neu Generierung ausgeführt werden - für Fragen, was ich damit meine an Karan
  //Grund: Es soll nur einmal (in checkSession()) der Token gelöscht und neu generiert werden. Daher ist es wichtig, dass selbst bei der Onit dies sichergestellt ist.
  //Sonst würde angenommen zweimal der gleiche Token gelöscht werden und zwei mal ein neuer Token generiert werden.
  //Daher in den Methoden die in OnInit aufgerufen werden nicht die Token Löschung und neu Generierung mit implementieren.
  //Sowie checkSession() übers .html interaktion --- (click)="checkSession()" --- aufrufen, um dadurch den Token zu aktualisieren

  //ABER: Der Test, ob der Token existiert, damit eine Mapping-Anfrage ausgeführt werden kann muss dennoch mitimplementiert werden!


}
