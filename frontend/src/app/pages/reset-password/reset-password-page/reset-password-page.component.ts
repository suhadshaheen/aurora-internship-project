import { Component } from '@angular/core';
import { LoginCardComponent } from '../../../shared/components/login-card/login-card.component';
import { ResetPasswordCardComponent } from '../components/reset-password-card/reset-password-card.component';

@Component({
  selector: 'app-reset-password-page.component',
  imports: [LoginCardComponent, ResetPasswordCardComponent],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css',
})
export class ResetPasswordPageComponent {}
