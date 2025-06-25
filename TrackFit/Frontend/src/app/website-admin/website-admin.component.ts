import { Component, OnInit } from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import {RouterLink} from "@angular/router";
import {NavbarAdminComponent} from "../navbar-admin/navbar-admin.component";

@Component({
  selector: 'app-website-admin',
  standalone: true,
    imports: [
        RouterLink,
        NavbarAdminComponent
    ],
  templateUrl: './website-admin.component.html',
  styleUrl: './website-admin.component.scss'
})
export class WebsiteAdminComponent implements OnInit{

  //---Muss in jeder Komponente nach Login eingeführt werden............................
  //+import { Component, OnInit  } from '@angular/core';
  //+implements OnInit
  logedusername:string | null ='';
  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
  }
  //---Muss in jeder Komponente nach Login eingeführt werden............................

}
