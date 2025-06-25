import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
  imports: [
    FormsModule,
    NgForOf,
    NavbarComponent,
    NgIf,
    NgClass,
  ],
  standalone: true,
})
export class FriendsListComponent implements OnInit {
  logedusername: string | null = '';
  friends: any[] = [];
  sentRequests: any[] = [];
  receivedRequests: any[] = [];
  allUsers: { username: any }[] = [];
  searchText: string = '';
  visibility: string = ''; // Öffentlich oder Privat
  jwttoken: boolean = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.loadVisibility();
    this.loadFriends();
    this.loadSentRequests();
    this.loadReceivedRequests();
    this.getAllUsernames();
    this.checkSession();
  }
  reloadPage(): void {
    window.location.reload();
  }
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


  loadFriends(): void {
    if (this.logedusername) {
      this.http.get<any[]>(`http://localhost:8080/api/v1/friends/list?username=${this.logedusername}`)
        .subscribe({
          next: (data) => {
            this.friends = data;
            console.log('Freundesliste geladen:', this.friends);
          },
          error: (error) => console.error('Fehler beim Abrufen der Freundesliste:', error)
        });
    }
  }

  loadSentRequests(): void {
    if (this.logedusername) {
      this.http.get<any[]>(`http://localhost:8080/api/v1/friends/sent-requests?username=${this.logedusername}`)
        .subscribe({
          next: (data) => {
            this.sentRequests = data;
            console.log('Gesendete Anfragen geladen:', this.sentRequests);
          },
          error: (error) => console.error('Fehler beim Abrufen der gesendeten Anfragen:', error)
        });
    }
  }

  loadReceivedRequests(): void {
    if (this.logedusername) {
      this.http.get<any[]>(`http://localhost:8080/api/v1/friends/received-requests?username=${this.logedusername}`)
        .subscribe({
          next: (data) => {
            this.receivedRequests = data;
            console.log('Empfangene Anfragen geladen:', this.receivedRequests);
          },
          error: (error) => console.error('Fehler beim Abrufen der empfangenen Anfragen:', error)
        });
    }
  }

  getAllUsernames(): void {
    if (this.logedusername) {
      this.http.get<any[]>(`http://localhost:8080/api/v1/user/usernames?excludeUsername=${this.logedusername}`)
        .subscribe({
          next: (usernames) => {
            this.allUsers = usernames.map((username) => ({ username }));
            console.log('Alle Benutzer geladen:', this.allUsers);
          },
          error: (error) => console.error('Fehler beim Abrufen der Benutzernamen:', error)
        });
    }
  }

  loadVisibility(): void {
    this.http.get(`http://localhost:8080/api/v1/friends/visibility?username=${this.logedusername}`, {
      responseType: 'text' // Antwort als Text behandeln
    }).subscribe({
      next: (response: string) => {
        console.log('API-Antwort für Sichtbarkeit:', response);
        this.visibility = response.trim() === 'public' ? 'öffentlich' : 'privat';
        console.log('Sichtbarkeit erfolgreich gesetzt auf:', this.visibility);
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Sichtbarkeit:', error);
        alert('Die Sichtbarkeit konnte nicht geladen werden.');
      }
    });

  }

  toggleVisibility(): void {
    if (!this.logedusername) {
      console.error('Benutzername fehlt. API-Request wird nicht ausgeführt.');
      return;
    }

    this.http
      .post(`http://localhost:8080/api/v1/friends/change-visibility?username=${this.logedusername}`, {}, {
        responseType: 'text' // Antwort als Text behandeln
      })
      .subscribe({
        next: (newVisibility: string) => {
          console.log('API-Antwort nach Umschalten der Sichtbarkeit:', newVisibility);
          this.visibility = newVisibility.trim() === 'public' ? 'öffentlich' : 'privat';
          console.log('Sichtbarkeit nach Umschalten gesetzt auf:', this.visibility);
          this.loadVisibility();
        },
        error: (error) => {
          console.error('Fehler beim Umschalten der Sichtbarkeit:', error);
          alert('Fehler beim Umschalten der Sichtbarkeit.');
        }
      });
  }




//FUnktioniert!

  sendFriendRequest(receiver: string): void {
    if (this.logedusername) {
      // Überprüfe, ob der Empfänger bereits ein Freund ist
      if (this.friends.includes(receiver)) {
        alert('Dieser Benutzer ist bereits in deiner Freundesliste.');
        return;
      }

      // Überprüfe, ob bereits eine Anfrage gesendet wurde
      if (this.sentRequests.includes(receiver)) {
        alert('Du hast diesem Benutzer bereits eine Freundschaftsanfrage gesendet.');
        return;
      }

      // Vorläufige UI-Aktualisierung: Füge den Empfänger in die Liste der gesendeten Anfragen ein
      this.sentRequests.push(receiver);

      // Freundschaftsanfrage mit den übergebenen Benutzernamen senden
      this.http
        .post(
          `http://localhost:8080/api/v1/friends/send-request?sender=${this.logedusername}&receiver=${receiver}`,
          {},
          { responseType: 'text' as 'json' } // Erwartet eine Text-Antwort
        )
        .subscribe({
          next: () => {
            console.log(`Freundschaftsanfrage an ${receiver} erfolgreich gesendet.`);
          },
          error: (error) => {
            console.error('Fehler beim Senden der Freundschaftsanfrage:', error);

            // Rückgängig machen, falls ein Fehler auftritt
            this.sentRequests = this.sentRequests.filter(
              (request) => request !== receiver
            );

            // Benutzerfreundliche Fehlermeldung
            if (error.status === 404) {
              console.log('Benutzer nicht gefunden. Bitte überprüfen Sie die Schreibweise.');
            } else if (error.status === 400) {
              console.log('Ungültige Anfrage. Bitte überprüfen Sie die Eingabedaten.');
            } else {
              console.log('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            }
          },
        });
    } else {
      console.log('Sie sind nicht eingeloggt.');
    }
  }


  respondToRequest(request: string, accept: boolean): void {
    if (this.logedusername) {
      const endpoint = accept ? 'accept-request' : 'reject-request';

      // Vorläufige UI-Aktualisierung: Entferne die Anfrage aus der Liste der empfangenen Anfragen
      this.receivedRequests = this.receivedRequests.filter((r) => r !== request);

      // Anfrage im Hintergrund verarbeiten
      this.http
        .post(
          `http://localhost:8080/api/v1/friends/${endpoint}?sender=${request}&receiver=${this.logedusername}`,
          {},
          { responseType: 'text' as 'json' }
        )
        .subscribe(
          () => {
            if (accept) {
              // Füge den neuen Freund zur Freundesliste hinzu
              this.friends.push(request);

              // Entferne die gesendete Anfrage (falls vorhanden) aus der Liste
              this.sentRequests = this.sentRequests.filter((r) => r !== request);
            }

            console.log(`Anfrage von ${request} erfolgreich verarbeitet.`);
          },
          (error) => {
            console.error('Fehler beim Beantworten der Anfrage:', error);

            // Rückgängig machen, falls ein Fehler auftritt
            this.receivedRequests.push(request);

            // Benutzerfreundliche Fehlermeldung
            if (error.status === 404) {
              alert('Benutzer nicht gefunden. Bitte überprüfen Sie die Schreibweise.');
            } else if (error.status === 400) {
              alert('Ungültige Anfrage. Bitte überprüfen Sie die Eingabedaten.');
            } else {
              alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
            }
          }
        );
    } else {
      alert('Sie sind nicht eingeloggt.');
    }
  }

  deleteFriend(friend: string): void {
    if (this.logedusername) {
      // Vorläufige UI-Aktualisierung: Entferne den Freund aus der Liste
      const previousFriends = [...this.friends];
      this.friends = this.friends.filter((f) => f !== friend);

      // Freund im Hintergrund entfernen
      this.http
        .delete(
          `http://localhost:8080/api/v1/friends/remove-friend?username=${this.logedusername}&friendUsername=${friend}`,
          { responseType: 'text' as 'json' } // Akzeptiert eine Textantwort
        )
        .subscribe(
          () => {
            console.log(`Freund ${friend} erfolgreich entfernt.`);
          },
          (error) => {
            console.error('Fehler beim Entfernen des Freundes:', error);

            // Rückgängig machen, falls ein Fehler auftritt
            this.friends = previousFriends;
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
          }
        );
    } else {
      alert('Sie sind nicht eingeloggt.');
    }
  }

  withdrawRequest(receiver: string): void {
    if (this.logedusername) {
      // Vorläufige UI-Aktualisierung: Entferne die Anfrage aus der Liste
      const previousSentRequests = [...this.sentRequests];
      this.sentRequests = this.sentRequests.filter((r) => r !== receiver);

      // Anfrage im Hintergrund zurückziehen
      this.http
        .post(
          `http://localhost:8080/api/v1/friends/withdraw-request?sender=${this.logedusername}&receiver=${receiver}`,
          {},
          { responseType: 'text' as 'json' } // Akzeptiert eine Textantwort
        )
        .subscribe(
          () => {
            console.log(`Freundschaftsanfrage an ${receiver} erfolgreich zurückgezogen.`);
          },
          (error) => {
            console.error('Fehler beim Zurückziehen der Anfrage:', error);

            // Rückgängig machen, falls ein Fehler auftritt
            this.sentRequests = previousSentRequests;
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
          }
        );
    } else {
      alert('Sie sind nicht eingeloggt.');
    }
  }






//es funktioniert

  navigateToProfile(username: string): void {
    sessionStorage.setItem('externalprofile', username);

    this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${username}`).subscribe({
      next: (role) => {
        if (role) {
          this.router.navigate(['/externalprofile']);
        } else {
          this.router.navigate(['/externalprofile-admin']);
        }
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Rolle:', error);
        alert('Die Rolle des Benutzers konnte nicht abgerufen werden.');
      },
    });
  }

  filteredUsers(): { username: string }[] {
    return this.allUsers.filter((user) =>
      user.username.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
