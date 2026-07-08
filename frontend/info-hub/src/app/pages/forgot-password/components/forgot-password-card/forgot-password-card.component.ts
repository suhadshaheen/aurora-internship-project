import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FORGOT_PASSWORD_CONSTANTS } from '../../forgot-password.constants';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.services';

@Component({
  selector: 'app-forgot-password-card',
  standalone: true,
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, FormField, RouterModule],
  templateUrl: './forgot-password-card.component.html',
  styleUrl: './forgot-password-card.component.css',
})
export class ForgotPasswordCard {
  messageService = inject(MessageService);
  authService = inject(AuthService);
  router = inject(Router);
  isLoading = false;
  constants = FORGOT_PASSWORD_CONSTANTS;

  model = signal({ email: '' });

  forgotForm = form(this.model, (path) => {
    required(path.email, {
      when: ({ state }) => state.dirty(),
      message: 'Email is required.',
    });
    email(path.email, {
      message: 'Enter a valid email address.',
    });
    pattern(path.email, /^[a-zA-Z0-9._%+-]+@auroratech\.ps$/, {
      message: 'Only @auroratech.ps emails are allowed.',
    });
  });

  //
  onSubmit(event: Event) {
    this.isLoading = true;
    this.authService.sendResetLink(this.forgotForm.email().value() ?? '').subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Email Sent!',
          detail: 'Check your inbox for the reset link.',
          life: 3000,
        });
        setTimeout(() => this.router.navigate(['/reset-password']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message,
          life: 3000,
        });
      },
    });
    event.preventDefault();
    submit(this.forgotForm, async () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Email Sent!',
        detail: 'Check your inbox for the reset link.',
        life: 3000,
      });
    });
  }
}
