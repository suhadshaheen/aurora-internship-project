import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthUser } from './auth.state';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),

    'Login Success': props<{
      user: AuthUser;
      token: string;
    }>(),

    'Login Failure': props<{ error: string }>(),

    'Logout': emptyProps(),

    'Clear Error': emptyProps()
  }
});