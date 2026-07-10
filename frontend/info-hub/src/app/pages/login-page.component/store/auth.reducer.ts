import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const getInitialAuthState = (): AuthState => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return initialAuthState;
  }

  const storedToken = window.localStorage.getItem('token');
  const storedUser = window.localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return initialAuthState;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as AuthState['user'];

    return {
      user: parsedUser,
      token: storedToken,
      isLoggedIn: true,
      loading: false,
      error: null,
    };
  } catch {
    return initialAuthState;
  }
};

export const authReducer = createReducer(
  getInitialAuthState(),

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoggedIn: true,
    loading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => ({
    ...initialAuthState
  })),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);