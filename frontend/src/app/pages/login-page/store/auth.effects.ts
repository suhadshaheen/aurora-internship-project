import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../../shared/services/auth.services';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthUser } from './auth.state';

@Injectable()
export class AuthEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            const user: AuthUser = {
              id: response.id,
              userHandle: response.userHandle,
              email: response.email,
              role: response.role,
            };

            return AuthActions.loginSuccess({ user, token: response.token });
          }),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error?.error?.message || error.message || 'Login failed'
              })
            )
          )
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        map(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
      ),
    { dispatch: false }
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate([this.getDashboardRoute(user.role)]);
        })
      ),
    { dispatch: false }
  );

  private getDashboardRoute(role: AuthUser['role']): string {
    if (role === 'ADMIN') return '/admin-dashboard';
    if (role === 'GUEST') return '/guest-dashboard';
    return '/employee-dashboard';
  }
}