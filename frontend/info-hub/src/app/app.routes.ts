import { Routes } from '@angular/router';
import { LandingPage } from './features/landing-page/landingPage.component';
import { LoginPageComponent } from './features/login-page.component/login-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage
  },
  {
    path: 'login',
    component: LoginPageComponent
  }
];