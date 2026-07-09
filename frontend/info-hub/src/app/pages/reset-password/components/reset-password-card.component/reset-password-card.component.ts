import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PasswordModule, ButtonModule, MessageModule, ToastModule, RouterModule],
  templateUrl: './reset-password-card.component.html',
  styleUrl: './reset-password-card.component.css',
})
export class ResetPasswordCardComponent {
  messageService = inject(MessageService);
  authService = inject(AuthService);
  router = inject(Router);
  constants = RESET_PASSWORD_CONSTANTS;
  isLoading = false;

  newPassword: string = '';
  confirmPassword: string = '';

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const p = this.newPassword;
    if (p.length === 0) return errors;
    if (p.length < 8) errors.push('At least 8 characters.');
    if (!/[A-Z]/.test(p)) errors.push('At least one uppercase letter.');
    if (!/[a-z]/.test(p)) errors.push('At least one lowercase letter.');
    if (!/[0-9]/.test(p)) errors.push('At least one number.');
    return errors;
  }

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
  }

  get isFormValid(): boolean {
    return (
      this.newPassword.length > 0 &&
      this.confirmPassword.length > 0 &&
      this.passwordErrors.length === 0 &&
      !this.passwordMismatch
    );
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isFormValid) return;

    this.isLoading = true;
    const email = localStorage.getItem('resetEmail') ?? '';

    this.authService.resetPassword(email, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
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
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message,
          life: 3000,
        });
      },
    });
  }
}

//هاي
