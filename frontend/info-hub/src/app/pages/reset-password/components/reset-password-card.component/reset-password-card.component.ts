import { Component, inject, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { form, required, pattern } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RESET_PASSWORD_CONSTANTS } from '../../reset-password.constants';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.services';

@Component({
  selector: 'app-reset-password-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PasswordModule, ButtonModule, MessageModule, ToastModule, RouterModule, FormsModule],
  templateUrl: './reset-password-card.component.html',
  styleUrl: './reset-password-card.component.css',
})
export class ResetPasswordCardComponent {
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly constants = RESET_PASSWORD_CONSTANTS;
  protected readonly isLoading = signal(false);

  protected readonly model = signal({ newPassword: '', confirmPassword: '' });

  protected readonly resetForm = form(this.model, (path) => {
    required(path.newPassword, { message: 'Password is required.' });
    pattern(path.newPassword, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
      message: 'Must be 8+ characters with uppercase, lowercase, and a number.',
    });
    required(path.confirmPassword, { message: 'Please confirm your password.' });
  });

  protected readonly passwordMismatch = computed(() => {
    const { newPassword, confirmPassword } = this.model();
    return confirmPassword.length > 0 && newPassword !== confirmPassword;
  });

  protected readonly isFormValid = computed(() => {
    return this.resetForm().valid() && !this.passwordMismatch();
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isFormValid()) return;

    this.isLoading.set(true);
    const email = localStorage.getItem('resetEmail') ?? '';

    this.authService.resetPassword(email, this.model().newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        localStorage.removeItem('resetEmail');
        this.messageService.add({
          severity: 'success',
          summary: this.constants.toast.summary,
          detail: this.constants.toast.detail,
          life: 3000,
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
