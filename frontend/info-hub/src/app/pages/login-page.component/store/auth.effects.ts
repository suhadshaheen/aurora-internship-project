import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../../shared/services/auth.services';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ user, token }) =>
            AuthActions.loginSuccess({ user, token })
          ),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.message || 'Login failed'
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
        map(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}
}