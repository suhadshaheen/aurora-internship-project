import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login-card',
  imports: [CardModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css',
})
export class LoginCardComponent {
  formTitle = input<string>('');
  formDescription = input<string>('');
  cardTitle = input<string>('');
  cardDescription = input<string>('');
}
