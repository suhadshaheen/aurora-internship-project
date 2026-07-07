import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class Navbar {
  protected readonly appName = 'Info Hub';
  protected readonly navbarTagline = 'ORGANIZE · SHARE · EMPOWER';
}
