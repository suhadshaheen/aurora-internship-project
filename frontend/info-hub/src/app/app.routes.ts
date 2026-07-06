import { Routes } from '@angular/router';
import { LandingPage } from './features/landing-page/landingPage.component';
import { LoginPageComponent } from './features/login-page.component/login-page.component';
import { ForgotPasswordPage } from './features/forgot-password/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './features/reset-password/reset-password-page.component/reset-password-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
  },
  {
    path: 'reset-password',
    component: ResetPasswordPageComponent,
  },
];
