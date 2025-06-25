import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import {CommonModule, NgForOf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-profilesearch-admin',
  standalone: true,
  imports: [
    NavbarComponent,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    NavbarAdminComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './profilesearch-admin.component.html',
  styleUrl: './profilesearch-admin.component.scss'
})
export class ProfilesearchAdminComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername:string | null ='';
  blockCount: number = 1; //Startwert für Anzahl der 8*8 Blöcke für die gelisteten User
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    this.getUsernames();
    this.checkSession();
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................



  constructor(private router: Router, private http: HttpClient) {
  }


  //---Logout mit Löschung des JWTTokens............................
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







  searchText: string = '';
  sortDirection: boolean = true; // true for ascending, false for descending
  data: { username:string }[] = [];
  getUsernames(){
    this.http.get<string[]>(`http://localhost:8080/api/v1/user/usernames?excludeUsername=${this.logedusername}`).subscribe(
      (usernames) => {
        this.data = usernames.map(username => ({ username }));
        console.log('Usernames:', this.data);
      },
      (error) => {
        console.error('Error fetching usernames:', error);
      }
    );
  }

  filteredData() {
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

  //---RoleCheck x navigate...........................................................
  role: boolean = false;
  navigate(username: string) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${username}`).subscribe(
      (role) => {
        this.role = role;
        sessionStorage.setItem('externalprofile', username);
        console.log('Role updated:', this.role);
        if (this.role) {
          this.router.navigate(['/externalprofile']).then(() => {
            console.log('Navigated to /website');
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        } else {
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

  //Methode um die Anzahl der benötigten 8*8 Blöcke zu berechnen, in Abhängigkeit der gelisteten User (je Block max 8*8=64 User)
  updateBlockCount(dataLength: number = this.data.length) {
    this.blockCount = Math.ceil(dataLength / 64);
  }
  //---RoleCheck x navigate...........................................................

}
