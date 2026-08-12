import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { AuthEffects } from './auth.effects';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../../shared/services/auth.services';
import { AuthUser } from './auth.state';

describe('AuthEffects', () => {
  let effects: AuthEffects;
  let actions$: Observable<any>;
  let authServiceMock: { login: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    authServiceMock = { login: jest.fn() };
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login$', () => {
    it('should dispatch loginSuccess with a normalized user (role trimmed and uppercased) on success', async () => {
      authServiceMock.login.mockReturnValue(
        of({
          id: 1,
          userHandle: 'John',
          email: 'john@example.com',
          role: '  employee  ' as any,
          token: 'abc-token',
        }),
      );

      actions$ = of(AuthActions.login({ email: 'john@example.com', password: 'secret' }));

      const result = await firstValueFrom(effects.login$);

      expect(authServiceMock.login).toHaveBeenCalledWith('john@example.com', 'secret');
      expect(result).toEqual(
        AuthActions.loginSuccess({
          user: {
            id: 1,
            userHandle: 'John',
            email: 'john@example.com',
            role: 'EMPLOYEE',
          } as AuthUser,
          token: 'abc-token',
        }),
      );
    });

    it('should dispatch loginFailure with the server-provided error message on failure', async () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid email or password' } })),
      );

      actions$ = of(AuthActions.login({ email: 'wrong@example.com', password: 'bad' }));

      const result = await firstValueFrom(effects.login$);

      expect(result).toEqual(
        AuthActions.loginFailure({ error: 'Invalid email or password' }),
      );
    });

    it('should fall back to error.message when there is no error.error.message', async () => {
      authServiceMock.login.mockReturnValue(throwError(() => new Error('Network down')));

      actions$ = of(AuthActions.login({ email: 'a@b.com', password: 'x' }));

      const result = await firstValueFrom(effects.login$);

      expect(result).toEqual(AuthActions.loginFailure({ error: 'Network down' }));
    });

    it('should fall back to a generic "Login failed" message when no error details exist', async () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({})));

      actions$ = of(AuthActions.login({ email: 'a@b.com', password: 'x' }));

      const result = await firstValueFrom(effects.login$);

      expect(result).toEqual(AuthActions.loginFailure({ error: 'Login failed' }));
    });
  });

  describe('logout$ (dispatch: false)', () => {
    it('should remove token and user from localStorage', async () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      actions$ = of(AuthActions.logout());

      await firstValueFrom(effects.logout$);

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('loginSuccess$ (dispatch: false)', () => {
    const user: AuthUser = {
      id: 1,
      userHandle: 'John',
      email: 'john@example.com',
      role: 'EMPLOYEE',
    };

    it('should store token and user in localStorage', async () => {
      actions$ = of(AuthActions.loginSuccess({ user, token: 'my-token' }));

      await firstValueFrom(effects.loginSuccess$);

      expect(localStorage.getItem('token')).toBe('my-token');
      expect(JSON.parse(localStorage.getItem('user') ?? 'null')).toEqual(user);
    });

    it('should navigate to /admin-dashboard for an ADMIN user', async () => {
      actions$ = of(
        AuthActions.loginSuccess({ user: { ...user, role: 'ADMIN' }, token: 't' }),
      );

      await firstValueFrom(effects.loginSuccess$);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
    });

    it('should navigate to /guest-dashboard for a GUEST user', async () => {
      actions$ = of(
        AuthActions.loginSuccess({ user: { ...user, role: 'GUEST' }, token: 't' }),
      );

      await firstValueFrom(effects.loginSuccess$);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/guest-dashboard']);
    });

    it('should navigate to /employee-dashboard for any other role', async () => {
      actions$ = of(
        AuthActions.loginSuccess({ user: { ...user, role: 'EMPLOYEE' }, token: 't' }),
      );

      await firstValueFrom(effects.loginSuccess$);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/employee-dashboard']);
    });
  });
});