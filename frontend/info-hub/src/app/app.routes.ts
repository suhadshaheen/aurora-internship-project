import { Routes } from '@angular/router';
<<<<<<< HEAD
import { authGuard } from '../guards/auth.guard';

=======
import { LandingPage } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page.component/login-page.component';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password-page.component/reset-password-page.component';
import { EmployeeDashboardComponent } from './pages/dashboard/employee-dashboard/employee-dashboard.component';
import { authGuard } from '../guards/auth.guard';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { GuestDashboardComponent } from './pages/dashboard/guest-dashboard/guest-dashboard.component';
>>>>>>> 6b8f4cc1b2c3483df9634a0579dd448ddb671c1c
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landingPage.component').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page.component/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password-page.component/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent,
      ),
  },
  {
    path: 'employee-dashboard',
    loadComponent: () =>
      import('./pages/dashboard/employee-dashboard/employee-dashboard.component').then(
        (m) => m.EmployeeDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'guest-dashboard',
    loadComponent: () =>
      import('./pages/dashboard/guest-dashboard.component/guest-dashboard.component').then((m) => m.GuestDashboardComponent),
    canActivate: [authGuard],
  },
];
