import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { NavbarAdminComponent } from "../navbar-admin/navbar-admin.component";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";


@Component({
  selector: 'app-socialfeed-admin',
  templateUrl: './socialfeed-admin.component.html',
  standalone: true,
  imports: [
    DatePipe, //Import zur Formatierung von Datums zu Format yyyy-mm-dd
    DecimalPipe, //Import zur Formatierung von Dezimalzahlen
    NgIf, //Dadurch können Elemente basierend auf Bedingungen ein-/Ausgeblendet werden
    NgForOf,
    NavbarAdminComponent,
    FormsModule,
    NgClass
  ],
  styleUrls: ['./socialfeed-admin.component.scss']
})
export class SocialfeedAdminComponent implements OnInit {
  data: any[] = [];
  logedusername: string | null = ''; //dadurch kann die V entweder ein bestimmter Wert oder null also " sein
  searchText: string = '';
  jwttoken: boolean = true;

  // Variable die Profilbilder der angezeigten Benutzer in einer Art Array speichert
  // Dabei sind die Benutzernamen die Schlüssel
  // Zum Beispiel "Mojo": Bild, "Mojojo": Bild
  //Da es sein kann das ein Benutzer mehrfach im SF auftaucht, kann man so ganz einfach anhand des usernamen
  //Die Bilder abrufen
  userProfilePictures: { [username: string]: string } = {};

  constructor(private http: HttpClient, private router: Router) {}
  //Methode zur Instanzierung von Abhängigkeiten wie im Backend durch Autowired
  //Es eine private Instanz iniziert die durch ihrer Schlüsselwörter dadurch wird es ermöglicht zu
  //navigieren innerhalb der Komponenten oder http Anfragen auszuführen

  //Instanzierung mit Geschäftslogik
  //Während der Constructor die Abhängigkeiten gleichzeitig instanziert also ausführt
  //Dadurch kann eine Geschäftslogik implementiert werden, sodass erstmal x und dann y ausgeführt wird.
ngOnInit() {//Im Gegensatz zum Conrstructor wo die der Code gleichzeitig ausgeführt wird
    this.logedusername = sessionStorage.getItem('username');
    this.checkSession();
    this.getAllActivities();
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

  getAllActivities(): void {
    //.subscribe für callbacks
    this.http.get<any[]>(`http://localhost:8080/api/v1/activity/all`).subscribe({
      //any[] weil wir eine Liste bzw. ein JSON-Array als Antwort wollen
      next: async (response) => {//Async ist ein Schlüsselwort, das asynchronität ermöglicht
        //also das await, dadurch wird halt gewartete bis alle bilder geladen sind und danach
        //der weitere Code ausgeführt
        //Konstante mit die alle Promises speichert
        const userProfilesLoadPromises = response.map((activity) =>
          this.getProfilePictureForUser(activity.username)
        );
        //Für jede Aktivität wird die Methode this.getProfilePictureForUser(activity.username) ausgeführt indem
        //der Unsername übergeben wird. diese werden in der Constante gespeichert

        await Promise.all(userProfilesLoadPromises);
        //es wird gecheckt ob alle Promises der Überprüfungen akzeptiert oder abgelehnt wurden
        //ist dem so so wird ein neuer Promise zurückgegeben durch promise.all
        //mit diesem nachdem diesen neuen Promise kann fortgefahren werden

        //diese VariableXArray wird halt vor dem wieterführenden Mapping gemachtt

        this.data = response //danach werden alle Aktivitäten in data geladen aber zuvor gemaped
          .map((activity) => { //jede Aktivität aus Repsonse wird einzeln wie folgt bearbeitet
            const isOwner = activity.username === this.logedusername;
            //diese Kontsante überprüft, ob die betrachtete Aktität der eingelogten User zugehörig ist
            //Dabei ist diese Konstante ein Boolean
            const userHasLiked = activity.likes.includes(this.logedusername);
            //Diese Konstante überprüft ob der angemeldete Benutzer die Aktivität geliked hat
            //Ist auch ein Boolean

            return { //dadurch wir ein neues Objekt erstellt
              ...activity, //Spread der die Eigenschaften des alten Objekts
              //also der betrachteen Aktivität in das neue Objekt kopiert
              likeCount: activity.likes ? activity.likes.length : 0, //neue eigenschaft
              //wenn die Aktivität geliked worden ist, wird die Länge des Array bestimmt
              //um die GesamtlikesAnzahl zu betsimmen.
              //Sonst ist halt die Likeanzahl 0
              isOwner, //neue Eigenschaft bzw der boolean wert ob eigene Aktivität oder nicht
              userHasLiked, //gleiches
              marker: this.getMarker(activity, isOwner), //ruft die getMarker auf
              //die Eigenschaft marker wird hinzugefügt und durch den wert der Methode betsimmt
              //eigene Aktivität? nur für Freunde? private?
              showDetails: false, //ist eine neue Eigenschaft die auf false gesetzt wird
              //diese wird in der html benutzt um Details anzuzeigen in den Kacheln
              profilePicture: this.userProfilePictures[activity.username] || 'assets/default-profile.png'
              //pP als neue Eigenschaft dadurch wird die Array artige Variable oben
              //gecheckt, ob der User der Aktivität ein PB besitzt
              //ansonsten wird halt ein default PB aus den Assets hinterlegt
            };
          })
          .sort((a, b) => b.activityid - a.activityid)
          //a und B sind im Prinzip Aktivitäten die auf ihre id überprüft werden
          //weil ids sequenziell wird durch b.activityid - a.activityid das ergebnis positiv
          //dehalb wird absteigend sortiert
          // Neueste Aktivitäten zuerst
          //dadurch wird halt absteigend anhand der ID sortiert. diese sind ja sequenziell
          .slice(0, 15); // Dadurch werden die ersten 15 Aktivitäten der Liste beibehalten
        //der rest wird entfernt
        //Start und end index in der data
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Aktivitäten:', error);
      }
    });
  }

  getProfilePictureForUser(username: string): Promise<void> {
    //Benutzername wird genommen und ein Promise zurückgegeben als Rckmeldung
    //dieser Promise wird durch void gekennzeichnet, da dieser kein epliziertr wert ist
    return new Promise((resolve, reject) => {
      //promise wird erstellt mit den Parametern resolve und reject
      //entweder resolve oder reject
      if (!this.userProfilePictures[username]) { //guckt ob der Username bereits in userProfilePictures VariableXArray drin ist
        //wenn nicht dann wird jalt der user gezogen
        this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${username}`).subscribe({
          next: (user) => {
            //und dann wird halt der BASE64String mit dem Usernamen als Schlüssel in userProfilePictures geladen
            // Falls der Benutzer kein Profilbild hat, setze das Standardbild
            this.userProfilePictures[username] = user.profilepicture || 'assets/profilicon.png';
            resolve(); // Profilbild erfolgreich geladen - Rückmeldung wird zurückgegeben
          },
          error: (error) => {
            //wenn es aus welchen Gründen auch immer nicht funktioniert hat wird
            //der username mit dem Standardbild versehen
            console.error(`Fehler beim Abrufen des Profilbildes für den Benutzer ${username}:`, error);
            this.userProfilePictures[username] = 'assets/profilicon.png'; // Standardbild bei Fehler
            reject(error); //beim Zurückgeben wird der error-Message mitgegeben
          }
        });
      } else { //wenn bereits username enthalten
        resolve(); // Profilbild existiert bereits
      }
    });
  }

  getMarker(activity: any, isOwner: boolean): string {
    //die Konstante isOwner des Mappings und die Aktivität als Array werden übergeben
    //isOwner wird ind er Logik nicht verwendet, da Admins keine Aktivitäten haben.
    //deswegen muss nichts überprüft werden
    if (activity.visibility === 'nicht sichtbar') {
      return 'yellow';
    } else if (activity.visibility === 'nur Freunde') {
      return 'green';
    }
    return 'blue';
  }


  toggleActivityDetails(activity: any): void {
    activity.showDetails = !activity.showDetails;  // Umschalten der Details
    console.log(`Details für Aktivität ${activity.activityname} angezeigt: ${activity.showDetails}`);
  }


  //Kenan)
  toggleLikes(activity: any): void {
    const userAlreadyLiked = activity.likes.includes(this.logedusername);

    if (userAlreadyLiked) {
      this.http.delete(`http://localhost:8080/api/v1/activity/${activity.activityid}/unlike?username=${this.logedusername}`, { responseType: 'text' }).subscribe({
        next: () => {
          activity.likes = activity.likes.filter((user: string) => user !== this.logedusername);
          activity.userHasLiked = false;
          activity.likeCount = activity.likes.length;
          this.updateActivityLikes(activity);
        },
        error: (error) => {
          console.error('Fehler beim Entfernen des Likes:', error);
        }
      });
    } else {
      this.http.post(`http://localhost:8080/api/v1/activity/${activity.activityid}/like?username=${this.logedusername}`, {}, { responseType: 'text' }).subscribe({
        next: () => {
          activity.likes.push(this.logedusername);
          activity.userHasLiked = true;
          activity.likeCount = activity.likes.length;
          this.updateActivityLikes(activity);
        },
        error: (error) => {
          console.error('Fehler beim Hinzufügen des Likes:', error);
        }
      });
    }
  }



  mapActivityType(activityType: string): string {
    //Mapping mit schlüsselwert paaren
    //wenn die Aktivität Radfahren ist wird der String Radtour ausgeben, um in der
    //hmtl in den Kacheln schreiben zu können Radtour von ...
    //statt Radfahren von
    const mapping: { [key: string]: string } = {
      Radfahren: 'Radtour',
      Spazieren: 'Spaziergang',
      Wandern: 'Wanderung',
      Laufen: 'Lauf',
    };
    return mapping[activityType] || activityType;
    //hier wird halt entweder das Schlüsselpaar wenn vorhanden ausgegeben, sonst
    //einfach die Eingabe weil nichts gefunden wurde
  }

  filteredData(): any[] {
    return this.data.filter(item => item.activityname.toLowerCase().includes(this.searchText.toLowerCase()));
  }


  //Kenan
  updateActivityLikes(activity: any): void {//Kenan
    const index = this.data.findIndex(a => a.activityid === activity.activityid);
    if (index !== -1) {
      this.data[index] = { ...activity };
    }
  }
}
