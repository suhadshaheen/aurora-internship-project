import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-forgot-password-card',
  template: `
    <p-toast />
    <div class="flex justify-center">
      <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4 w-full sm:w-56">
        <div class="flex flex-col gap-1">
          <input
            pInputText
            type="text"
            id="sf_username"
            placeholder="Username"
            [formField]="exampleForm.username"
          />
          @if (exampleForm.username().touched() && exampleForm.username().invalid()) {
            @for (error of exampleForm.username().errors(); track error.kind) {
              <p-message severity="error" size="small" variant="simple">{{
                error.message
              }}</p-message>
            }
          }
        </div>
        <div class="flex flex-col gap-1">
          <input
            pInputText
            type="email"
            id="sf_email"
            placeholder="Email"
            [formField]="exampleForm.email"
          />
          @if (exampleForm.email().touched() && exampleForm.email().invalid()) {
            @for (error of exampleForm.email().errors(); track error.kind) {
              <p-message severity="error" size="small" variant="simple">{{
                error.message
              }}</p-message>
            }
          }
        </div>
        <button pButton severity="secondary" type="submit">Submit</button>
      </form>
    </div>
  `,
  standalone: true,
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, FormField],
})
export class ForgotPasswordCard {
  messageService = inject(MessageService);
  model = signal({ username: '', email: '' });
  exampleForm = form(this.model, (path) => {
    required(path.username, {
      when: ({ state }) => state.touched(),
      message: 'Username is required.',
    });
    required(path.email, { when: ({ state }) => state.touched(), message: 'Email is required.' });
    email(path.email, { message: 'Enter a valid email address.' });
  });
  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.exampleForm, async () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form is submitted',
        life: 3000,
      });
    });
  }
}
