import { Component, OnInit } from '@angular/core';
import { Router} from "@angular/router";
import {RouterLink} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  constructor(private router: Router, private http: HttpClient) {
  }

  //---UsernameCheck...........................................................
  commentLU: string = '';
  username: string = '';
  usernameExists: boolean = false;
  checkusernameexists(callback: () => void) {
    this.username = this.username.trim(); // Entfernt Leerzeichen am Anfang und Ende
    if (this.username === '') {
      this.commentLU = 'Bitte einen gültigen Benutzernamen eingeben.';
      callback();
      return;
    }
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/check-username?username=${this.username}`).subscribe(
      (exists) => {
        this.usernameExists = exists;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
      },
      (error) => { // Fehlermeldung, wenn die Überprüfung nicht abgeschlossen werden konnte
        console.error('Error checking username', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }


  checkusername() {
    this.checkusernameexists(() => {
      if (!this.usernameExists) {
        this.commentLU = 'Benutzername existiert nicht! Bitte die exakte Schreibweise verwenden.';
      } else {
        this.commentLU = '';
        this.commentcorrect();
      }
    });
  }

  //---UsernameCheck...........................................................



  //---PasswordCheck...........................................................
  commentLP: string = '';
  password: string = '';
  passwordCorrect: boolean = false;
  checkpasswordcorrect(callback: () => void) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/login?username=${this.username}&password=${this.password}`).subscribe(
      (isValidUser) => {
        this.passwordCorrect = isValidUser;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
      },
      (error) => {
        console.error('Error checking password', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }
  checkpassword() {
    this.checkpasswordcorrect(() => {
      if (!this.passwordCorrect) {
        this.commentLP = 'Passwort und Username stimmen nicht überein!';
      } else {
        this.commentLP = '';
        this.commentcorrect();
      }
    });
  }
  //---PasswordCheck...........................................................






  //---Login...........................................................
  role: boolean = false;
  commentLogin: string='';
  jwttoken: boolean = true;
  login() {
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.username}`).subscribe(
      (jwttoken) => {
        this.jwttoken = jwttoken;
        console.log('JWTToken:', this.jwttoken);
        if(this.jwttoken){
          this.commentLogin ='Für die Userdaten existiert bereits eine Sitzung. Geben Sie andere Userdaten ein oder warten Sie, bis die Sitzung abgelaufen ist.';
        } else {
            if (this.usernameExists && this.passwordCorrect && this.commentLP === '' && this.commentLU ==='') {
                  this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${this.username}`).subscribe(
                (role) => {
                  this.role = role;
                  console.log('Role updated:', this.role);
                  sessionStorage.setItem('username', this.username);
                  this.http.post(`http://localhost:8080/api/v1/jwttoken/generate?username=${this.username}`, {}).subscribe(
                    (token) => {
                      console.log('Token generated and saved:', token);
                    },
                    (error) => {
                      console.error('Error generating token', error);
                    }
                  );
                  if (this.role) {
                    this.router.navigate(['/website']).then(() => {
                      console.log('Navigated to /website');
                    }).catch(err => {
                      console.error('Navigation error:', err);
                    });
                  } else {
                    this.router.navigate(['/website-admin']).then(() => {
                      console.log('Navigated to /website-admin');
                    }).catch(err => {
                      console.error('Navigation error:', err);
                    });
                  }
                  alert('Anmeldung erfolgreich. Weiter mit der Startseite.');
                },
                (error) => {
                  console.error('Error checking user role', error);
                }
              );
            } else {
              this.commentLogin = 'Bitte geben Sie Ihren Usernamen und Ihr Passwort ein und korrigieren Sie Ihre Eingabe gemäß der Fehlermeldungen.';
            }

        }
      },
      (error) => {
        console.error('Error checking JWTToken', error);
      }
    );
  }



  //---Login...........................................................



  //---Kommentarkorrektur...........................................................
  commentcorrect(){
    if(this.username !== '' && this.password !== '' && this.commentLU === '' && this.commentLP === ''){
      this.commentLogin = '';
    }
  }
  //---Kommentarkorrektur...........................................................



//Keine Eingaben mit einem & Zeichen in Registrierung!! Verbieten Für den nächsten Zyklus

}
