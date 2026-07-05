import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-login-card',
  imports: [CardModule],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css',
})
export class LoginCardComponent {
  @Input() title1 = '';
  @Input() description1 = '';
  @Input() title2 = '';
  @Input() description2 = '';
}
