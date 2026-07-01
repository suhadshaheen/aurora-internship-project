import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
