import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth.guard';
import { AllUsersComponent } from './pages/dashboard/components/user/all-users/all-users.component';
import { adminGuard } from '../guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
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
      import('./pages/reset-password/reset-password-page/reset-password-page.component').then(
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
      import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'guest-dashboard',
    loadComponent: () =>
      import('./pages/dashboard/guest-dashboard/guest-dashboard.component').then(
        (m) => m.GuestDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    component: AllUsersComponent,
    canActivate: [authGuard, adminGuard],
  },
];
