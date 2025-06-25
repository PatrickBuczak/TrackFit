import { Component } from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterLink
  ],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {

}
