import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar.component';
import { Hero } from './components/hero/hero.component';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar, Hero],
  templateUrl: './landingPage.component.html',
  styleUrl: './landingPage.component.css',
})
export class LandingPage {}
