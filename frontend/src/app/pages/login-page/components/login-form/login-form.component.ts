import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth.actions';
import {
  selectAuthLoading,
  selectAuthError,
  selectIsLoggedIn,
  selectUserRole,
} from '../../store/auth.selectors';
import { AsyncPipe } from '@angular/common';
import { take } from 'rxjs';
import { LOGIN_FORM_CONSTANTS } from '../login-form.constants';
@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);

  readonly loginConstants = LOGIN_FORM_CONSTANTS;

  email: string = '';
  password: string = '';

  allowedDomain: string = '';

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  userRole$ = this.store.select(selectUserRole);

  ngOnInit(): void {
    this.isLoggedIn$.pipe(take(1)).subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        return;
      }

      this.userRole$.pipe(take(1)).subscribe((role) => {
        if (role === 'GUEST') {
          // Guest sessions shouldn't block a real login; clear it and stay on the login page.
          this.store.dispatch(AuthActions.logout());
          return;
        }

        this.router.navigate([this.getDashboardRoute(role)]);
      });
    });
  }

  private getDashboardRoute(role: string | null): string {
    if (role === 'ADMIN') return '/admin-dashboard';
    if (role === 'GUEST') return '/guest-dashboard';
    return '/employee-dashboard';
  }

  isEmailDomainValid(): boolean {
    if (!this.allowedDomain) {
      //this is temporary solution to allow any domain
      return true;
    }
    return this.email.endsWith(this.allowedDomain);
  }

  login(): void {
    if (!this.isEmailDomainValid()) {
      return;
    }

    this.store.dispatch(
      AuthActions.login({
        email: this.email.trim().toLowerCase(),
        password: this.password,
      }),
    );
  }
}
