import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landingPage.component';
import { LoginPageComponent } from './pages/login-page.component/login-page.component';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password-page.component/reset-password-page.component';
import { EmployeeDashboardComponent } from './pages/dashboard/employee-dashboard/employee-dashboard.component';
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
  {
    path: 'employee-dashboard',
    component: EmployeeDashboardComponent,
  }
];
