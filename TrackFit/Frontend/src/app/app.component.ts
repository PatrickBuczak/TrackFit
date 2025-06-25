import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { OnInit } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Frontend';
  //Der App-Name wird aus dem Backend gezogen. Erstes Funktionsfähiges Mapping.
  //Karan
  appName: string = '';
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get('http://localhost:8080/AppName', { responseType: 'text' })
      .subscribe(response => {
        this.appName = response;
      });
  }
  //---

  //Oben in den .htmls nach der Anmeldung
  //<app-navbar></app-navbar>
}
