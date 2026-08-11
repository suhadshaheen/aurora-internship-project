import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
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
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, FormField, RouterModule],
  templateUrl: './forgot-password-card.component.html',
  styleUrl: './forgot-password-card.component.css',
})
export class ForgotPasswordCard {
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly isLoading = signal(false);
  protected readonly constants = FORGOT_PASSWORD_CONSTANTS;
  protected readonly model = signal({ email: '' });

  protected readonly forgotForm = form(this.model, (path) => {
    required(path.email, {
      when: ({ state }) => state.dirty(),
      message: 'Email is required.',
    });
    email(path.email, {
      message: 'Enter a valid email address.',
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.forgotForm.email().invalid()) return;

    this.isLoading.set(true);

    this.authService.forgotPassword(this.forgotForm.email().value() ?? '').subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Check your email',
          detail: response.message,
          life: 5000,
        });
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'Something went wrong. Please try again.',
          life: 3000,
        });
      },
    });
  }
}
