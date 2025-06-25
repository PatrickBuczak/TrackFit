import {Component, HostListener, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";
import {HttpClient} from "@angular/common/http";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

/* Komponentendeklaration */
@Component({
  selector: 'app-profile-admin',
  standalone: true,
  imports: [
    RouterLink,
    NavbarAdminComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile-admin.component.html',
  styleUrl: './profile-admin.component.scss'
})

/* Klassendefinition */
export class ProfileAdminComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit

  logedusername:string | null ='';
  externprofile:string | null ='';
  friends: string[] = [];
  visibility: string | null ='';


  /* beim Öffnen wird logedusername auf den sessionstorage-username gesetzt und dessen Userdaten und Aktivitäten abgefragt */
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.getUserByUsername();
    this.checkSession()
  }


  /* Konstruktor incl. Navigation und HTTP-Kommunikation*/
  constructor(private router: Router, private http: HttpClient) {
  }



  jwttoken: boolean = true;

  /* Logout mit Löschung des JWTTokens und anschließender Weiterleitung zur Startseite */
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
                console.log('Navigated to /website-admin');
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
            console.log('Navigated to /website-admin');
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
              console.log('User:', this.userLoad);
              const imgElement = document.getElementById('profilbild') as HTMLImageElement;
              imgElement.src = this.userLoad.profilepicture;
            },
            (error) => {
              console.error('Error fetching user', error);
            }
          );
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

  /* Admin hat keine Aktivitäten */


  //---Navigate back............................


  //Achtung! in der OnInit darf nicht auch noch die Token Löschung und neu Generierung ausgeführt werden - für Fragen, was ich damit meine an Karan
  //Grund: Es soll nur einmal (in checkSession()) der Token gelöscht und neu generiert werden. Daher ist es wichtig, dass selbst bei der Onit dies sichergestellt ist.
  //Sonst würde angenommen zweimal der gleiche Token gelöscht werden und zwei mal ein neuer Token generiert werden.
  //Daher in den Methoden die in OnInit aufgerufen werden nicht die Token Löschung und neu Generierung mit implementieren.
  //Sowie checkSession() übers .html interaktion --- (click)="checkSession()" --- aufrufen, um dadurch den Token zu aktualisieren

  //ABER: Der Test, ob der Token existiert, damit eine Mapping-Anfrage ausgeführt werden kann muss dennoch mitimplementiert werden!




}
