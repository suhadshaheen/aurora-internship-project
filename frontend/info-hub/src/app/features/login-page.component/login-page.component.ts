import { Component } from '@angular/core';
import {LoginCardComponent} from '../../shared/components/login-card.component/login-card.component';
@Component({
  selector: 'app-login-page.component',
  imports: [LoginCardComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {}
