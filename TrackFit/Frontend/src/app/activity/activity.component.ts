import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'

})
export class ActivityComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername:string | null ='';
  username: string ="";
  jwttoken: boolean = true;
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.setusername();
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................



  constructor(private router: Router, private http: HttpClient) {
  }
  setusername(){
    this.username = this.logedusername || '';
  }

  selectedFile: File | null=null;
  visibility: string="";
  activityname: string="";// Werden leer gelassen und unten entsprechend dann gesetzt
  activitytype:string="";


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Die ausgewählte Datei speichern
    console.log(this.selectedFile);
  }
  uploadGpxFile(){//Upload gpx datei mit den fehlern
    if(!this.selectedFile|| !this.visibility) {
      alert('Bitte wählen sie eine Datei und die Sichtbarkeit ');
      return;
    }



    const formData = new FormData();

    formData.append('visibility', this.visibility);
    formData.append('gpxFile', this.selectedFile as File);
    formData.append('username', this.username);
    formData.append('activitytype',this.activitytype);
    formData.append('activityname',this.activityname);

//Post anfrage ans Backend wird gesendet mit der formData und dann wird reagiert.
    this.http.post('http://localhost:8080/api/v1/activitytrack/upload', formData).subscribe(
      (response: any) => {
        console.log('Erfolgreich hochgeladen', response);
        this.router.navigate(['activity-repository']);
      },//Zu posten der datei und consolen ergebniss
      (error:any) => {
        console.error('Fehler beim Hochladen:', error);
        alert(`Fehler beim Hochladen: ${error.message} (Status: ${error.status})`);
      }//Fehler falls nicht klappt mit message
    );
  }


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

//Merge completed - Mappe als nächstes stehen kleine bugfixes in der scss an und die Systemtests. Mappe ist bereits überarbeitet und muss nur noch um die Systemtests der anderen erweitert werden. Systemtests zur Anmeldung und Registrierung sind bereits fertig.
}
