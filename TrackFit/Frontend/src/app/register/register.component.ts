import { Component, OnInit } from '@angular/core';
import { Router} from "@angular/router";
import {RouterLink} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {


  //---Registrierungsfomulare anzeigen...........................................................
  currentSection: string = '';

  showFormular(text: string) {
    this.currentSection = text;
  }

  //---Registrierungsfomulare anzeigen...........................................................


  //--- Passworteingabeübereinstimmung für Admins...........................................................
  commentPA: string = '';
  passwordA: string = '';
  confirmPasswordA: string = '';

  validatePasswords() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
    if (!passwordPattern.test(this.passwordA)) {
      this.commentPA = 'Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, ein Sonderzeichen, eine Ziffer und mindestens 8 Zeichen enthalten.';
    } else if (this.passwordA !== this.confirmPasswordA) {
      this.commentPA = 'Passwörter stimmen nicht überein! Bitte korrigieren.';
    } else {
      this.commentPA = '';
      this.commentcorrectA();
    }
  }

  //--- Passworteingabeübereinstimmung für Admins...........................................................


  //--- Passworteingabeübereinstimmung für reguläre Benutzer...........................................................
  commentPR: string = '';
  passwordR: string = '';
  confirmPasswordR: string = '';

  validatePasswordsR() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
    if (!passwordPattern.test(this.passwordR)) {
      this.commentPR = 'Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, ein Sonderzeichen, eine Ziffer und mindestens 8 Zeichen enthalten.';
    } else if (this.passwordR !== this.confirmPasswordR) {
      this.commentPR = 'Passwörter stimmen nicht überein! Bitte korrigieren.';
    } else {
      this.commentPR = '';
      this.commentcorrectR();
    }
  }

  //--- Passworteingabeübereinstimmung für reguläre Benutzer...........................................................


  //--- EMail Check für Admins...........................................................
  commentEA: string = '';
  emailA: string = '';
  emailExistsA: boolean = false;

  checkemailexistsA(callback: () => void) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/check-email?email=${this.emailA}`).subscribe(
      (exists) => {
        this.emailExistsA = exists;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
        //Sicherstellung, dass bis zur Überprüfung gewartet wird und die Methode entsprechend ausgeführt wird
      },
      (error) => {
        console.error('Error checking email', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }

  checkemailA() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.emailA)) {
      this.commentEA = 'Ihre Eingabe ist keine gültige E-Mail! Bitte korrigieren.';
      return;
    } else {
      this.commentEA = '';
      this.commentcorrectA();
    }
    this.checkemailexistsA(() => {
      if (this.emailExistsA) {
        this.commentEA = 'Mit dieser E-Mail wurde sich bereits registriert! Bitte geben Sie eine andere E-Mail ein.';
      } else {
        this.commentEA = '';
        this.commentcorrectA();
      }
    });
  }

  //--- EMail Check für Admins...........................................................


  //--- EMail Check für reguläre Benutzer...........................................................
  commentER: string = '';
  emailR: string = '';
  emailExistsR: boolean = false;

  checkemailexistsR(callback: () => void) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/check-email?email=${this.emailR}`).subscribe(
      (exists) => {
        this.emailExistsR = exists;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
      },
      (error) => {
        console.error('Error checking email', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }

  checkemailR() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.emailR)) {
      this.commentER = 'Ihre Eingabe ist keine gültige E-Mail! Bitte korrigieren.';
      return;
    } else {
      this.commentER = '';
      this.commentcorrectR();
    }
    this.checkemailexistsR(() => {
      if (this.emailExistsR) {
        this.commentER = 'Mit dieser E-Mail wurde sich bereits registriert! Bitte geben Sie eine andere E-Mail ein.';
      } else {
        this.commentER = '';
        this.commentcorrectR();
      }
    });
  }

  //--- EMail Check für reguläre Benutzer...........................................................


  //--- Username Check für Admins...........................................................
  commentUA: string = '';
  usernameA: string = '';
  usernameExistsA: boolean = false;

  checkusernameexistsA(callback: () => void) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/check-username?username=${this.usernameA}`).subscribe(
      (exists) => {
        this.usernameExistsA = exists;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
      },
      (error) => {
        console.error('Error checking username', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }

  checkusernameA() {
    this.checkusernameexistsA(() => {
      if (this.usernameExistsA) {
        this.commentUA = '\'Dieser Benutzername ist bereits vergeben.\'';
      } else {
        this.commentUA = '';
        this.commentcorrectA();
      }
    });
  }

  //--- Username Check für Admins...........................................................


  //--- Username Check für reguläre Benutzer...........................................................
  commentUR: string = '';
  usernameR: string = '';
  usernameExistsR: boolean = false;

  checkusernameexistsR(callback: () => void) {
    this.http.get<boolean>(`http://localhost:8080/api/v1/user/check-username?username=${this.usernameR}`).subscribe(
      (exists) => {
        this.usernameExistsR = exists;
        callback(); // Rufe die Callback-Funktion auf, nachdem die Überprüfung abgeschlossen ist
      },
      (error) => {
        console.error('Error checking username', error);
        callback(); // Rufe die Callback-Funktion auch im Fehlerfall auf
      }
    );
  }

  checkusernameR() {
    this.checkusernameexistsR(() => {
      if (this.usernameExistsR) {
        this.commentUR = 'Dieser Benutzername ist bereits vergeben.';
      } else {
        this.commentUR = '';
        this.commentcorrectR();
      }
    });
  }

  //--- Username Check für reguläre Benutzer...........................................................


  //--- Profilbild String-Test für Admin...........................................................
  profiletestA: string = '';

  onFileSelectedA(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.type;
      const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      this.profiletestA = '';
      if (!validImageTypes.includes(fileType)) { alert('Bitte wählen Sie eine gültige Bilddatei aus (GIF, JPEG, PNG).'); event.target.value = ''; // Reset the input field
      } else { this.reduceImageQualityA(file); }
    }
  }

  reduceImageQualityA(file: File, quality = 0.95, maxWidth = 200, maxHeight = 200) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        // Skalieren Sie das Bild herunter, wenn es größer als die maximale Breite oder Höhe ist
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);
          const reducedQualityImageA = canvas.toDataURL('image/jpeg', quality);
          this.profiletestA = reducedQualityImageA;
        }
      };
    };
    reader.readAsDataURL(file);
  }

  //--- Profilbild String-Test für Admin...........................................................


  //--- Profilbild String-Test für regulärer Benutzer...........................................................
  profiletestR: string = '';

  onFileSelectedR(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.type;
      const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      this.profiletestR = '';
      if (!validImageTypes.includes(fileType)) { alert('Bitte wählen Sie eine gültige Bilddatei aus (GIF, JPEG, PNG).'); event.target.value = ''; // Reset the input field
      } else { this.reduceImageQualityR(file); }
    }

  }

  reduceImageQualityR(file: File, quality = 0.95, maxWidth = 200, maxHeight = 200) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        // Skalieren Sie das Bild herunter, wenn es größer als die maximale Breite oder Höhe ist
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);
          const reducedQualityImageR = canvas.toDataURL('image/jpeg', quality);
          this.profiletestR = reducedQualityImageR;
        }
      };
    };
    reader.readAsDataURL(file);
  }

  //--- Profilbild String-Test für regulärer Benutzer...........................................................


  //--- Registrierungspflichtfelder, Registrierung und Router für Admin...........................................................
  commentRegisterA: string = '';
  userA = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    profilepicture: '',
    role: ''
  };

  constructor(private router: Router, private http: HttpClient) {
  }

  onSubmitA() {
    this.http.post('http://localhost:8080/api/v1/user/addUser', this.userA)
      .subscribe(response => {
        console.log('User added successfully', response);
      }, error => {
        console.error('Error adding user', error);
      });
  }

  friendA = { username: "", role: "", friends: [], friendrequestIn: [], friendrequestOut: [], visibility: "" };
  friendsA(){
    this.friendA.username = this.userA.username;
    this.friendA.role = this.userA.role;
    this.friendA.visibility = "nicht sichtbar";
    this.http.post('http://localhost:8080/api/v1/friends/create', this.friendA)
      .subscribe(response => {
        console.log('User added successfully', response);
      }, error => {
        console.error('Error adding user', error);
      });
  }

  registerA() {
    const firstNameField = (document.getElementById('inputField11') as HTMLInputElement).value;
    const lastNameField = (document.getElementById('inputField12') as HTMLInputElement).value;

    // Prüfen, ob kein Profilbild hochgeladen wurde, und Standardbild setzen
    if (!this.profiletestA) {
      this.profiletestA = 'assets/no_profile_picture.png'; // Standardbild für Administratoren
    }

    this.userA = {
      username: this.usernameA,
      firstname: firstNameField,
      lastname: lastNameField,
      email: this.emailA,
      password: this.passwordA,
      profilepicture: this.profiletestA,
      role: 'Administrator'
    };
    if (this.emailA && this.passwordA && this.confirmPasswordA && this.usernameA && firstNameField && lastNameField && this.commentEA === '' && this.commentPA === '' && this.commentUA === '') {
      this.onSubmitA();
      this.friendsA();
      this.router.navigate(['/login']);
      alert('Registrierung war erfolgreich. Weiter mit der Anmeldung.');
    } else {
      this.commentRegisterA = 'Bitte befüllen Sie alle mit * markierten Pflichtfelder und korrigieren Sie Ihre Eingabe gemäß der Fehlermeldungen.';
    }
  }

  //--- Registrierungspflichtfelder, Registrierung und Router für Admin...........................................................


  //--- Registrierungspflichtfelder, Registrierung und Router für regulärer Benutzer...........................................................
  commentRegisterR: string = '';
  userR = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    dateofbirth: '',
    bodysize: '',
    weight: '',
    gender: '',
    password: '',
    profilepicture: '',
    role: ''
  };

  onSubmitR() {
    this.http.post('http://localhost:8080/api/v1/user/addUser', this.userR)
      .subscribe(response => {
        console.log('User added successfully', response);
      }, error => {
        console.error('Error adding user', error);
      });
  }
  friendR = { username: "", role: "", friends: [], friendrequestIn: [], friendrequestOut: [], visibility: "" };
  friendsR(){
    this.friendR.username = this.userR.username;
    this.friendR.role = this.userR.role;
    this.friendR.visibility = "nicht sichtbar";
    this.http.post('http://localhost:8080/api/v1/friends/create', this.friendR)
      .subscribe(response => {
        console.log('User added successfully', response);
      }, error => {
        console.error('Error adding user', error);
      });
  }


  registerR() {
    const firstNameField = (document.getElementById('inputField2') as HTMLInputElement).value;
    const lastNameField = (document.getElementById('inputField3') as HTMLInputElement).value;
    const birthday = (document.getElementById('inputField5') as HTMLInputElement).value;
    const height = (document.getElementById('inputField6') as HTMLInputElement).value;
    const weight = (document.getElementById('inputField7') as HTMLInputElement).value;
    const gender = (document.getElementById('inputField8') as HTMLInputElement).value;

    // Prüfen, ob kein Profilbild hochgeladen wurde, und Standardbild setzen
    if (!this.profiletestR) {
      this.profiletestR = 'assets/no_profile_picture.png'; // Standardbild für reguläre Benutzer
    }

    this.userR = {
      username: this.usernameR,
      firstname: firstNameField,
      lastname: lastNameField,
      email: this.emailR,
      dateofbirth: birthday,
      bodysize: height,
      weight: weight,
      gender: gender,
      password: this.passwordR,
      profilepicture: this.profiletestR,
      role: 'regulärer Benutzer'
    };
    if (this.emailR && this.passwordR && this.confirmPasswordR && this.usernameR && firstNameField && lastNameField && birthday && height && weight && gender && this.commentER === '' && this.commentPR === '' && this.commentUR === '') {
      this.onSubmitR();
      this.friendsR();
      this.router.navigate(['/login']);
      alert('Registrierung war erfolgreich. Weiter mit der Anmeldung.');
    } else {
      this.commentRegisterR = 'Bitte befüllen Sie alle mit * markierten Pflichtfelder und korrigieren Sie Ihre Eingabe gemäß der Fehlermeldungen.';
    }
  }

  //--- Registrierungspflichtfelder, Registrierung und Router für regulärer Benutzer...........................................................


  //---Kommentarkorrektur für Administratoren...........................................................
  commentcorrectA() {
    const firstNameField = (document.getElementById('inputField11') as HTMLInputElement).value;
    const lastNameField = (document.getElementById('inputField12') as HTMLInputElement).value;
    if (firstNameField !== '' && lastNameField !== '' && this.passwordA !== '' && this.emailA !== '' && this.usernameA !== '' && this.commentPA === '' && this.commentEA === '' && this.commentUA === '') {
      this.commentRegisterA = '';
    }
  }

  //---Kommentarkorrektur für Administratoren...........................................................


  //---Kommentarkorrektur für regulärer Benutzer...........................................................
  commentcorrectR() {
    if (this.passwordR !== '' && this.emailR !== '' && this.usernameR !== '' && this.commentPR === '' && this.commentER === '' && this.commentUR === '') {
      this.commentRegisterR = '';
    }
  }

  //---Kommentarkorrektur für regulärer Benutzer...........................................................


}
//Keine Eingaben mit einem & Zeichen in Registrierung!! Verbieten Für den nächsten Zyklus
