import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
    RouterLink
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  email = '';
  password = '';

  allowedDomain = '@auroratech.ps'; 

  isEmailDomainValid(): boolean {
    return this.email.endsWith(this.allowedDomain);
  }

  login() {
    if (!this.email || !this.password || !this.isEmailDomainValid()) {
      return;
    }

    console.log('Email:', this.email);
    console.log('Password:', this.password);
  }
}