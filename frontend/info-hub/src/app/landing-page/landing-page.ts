import { Component } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar, Hero],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
