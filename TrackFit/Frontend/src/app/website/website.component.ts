import { Component, OnInit  } from '@angular/core';
import {RouterLink} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss'
})
export class WebsiteComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername:string | null ='';
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................

}
