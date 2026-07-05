import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-login-card',
  imports: [CardModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css',
})
export class LoginCardComponent {readonly title1 = '';
  readonly description1 = '';
  readonly title2 = '';
  readonly description2 = '';}
