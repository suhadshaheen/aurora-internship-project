import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ForgotPasswordCard } from '../components/forgot-password-card/forgot-password-card.component';
import { LoginCardComponent } from '../../../shared/components/login-card.component/login-card.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ForgotPasswordCard, LoginCardComponent],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {}
