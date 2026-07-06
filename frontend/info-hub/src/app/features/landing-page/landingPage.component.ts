import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar.component';
import { Hero } from './components/hero/hero.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar, Hero, RouterLink],
  templateUrl: './landingPage.component.html',
  styleUrl: './landingPage.component.css',
})
export class LandingPage {}
