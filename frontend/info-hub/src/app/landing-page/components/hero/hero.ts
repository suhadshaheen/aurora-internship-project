import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-hero',
  imports: [CardModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  readonly title = "Your team's collective intelligence, organized.";

  readonly description =
    "Centralize documentation, onboard faster, and keep your team aligned — all in one place.";

  readonly loginText = "Log In";

  readonly guestText = "Continue as a Guest";

  readonly arrow = "->";
}
