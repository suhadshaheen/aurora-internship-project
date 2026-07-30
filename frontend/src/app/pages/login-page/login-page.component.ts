import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login-page.component',
  imports: [LoginCardComponent, LoginFormComponent, PasswordModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {}
