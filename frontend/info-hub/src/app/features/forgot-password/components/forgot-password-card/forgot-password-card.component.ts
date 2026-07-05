import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FORGOT_PASSWORD_CONSTANTS } from '../../forgot-password.constants';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password-card',
  standalone: true,
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, FormField, RouterModule],
  templateUrl: './forgot-password-card.component.html',
  styleUrl: './forgot-password-card.component.css',
})
export class ForgotPasswordCard {
  messageService = inject(MessageService);
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

  onSubmit(event: Event) {
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
