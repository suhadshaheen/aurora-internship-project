import {
  selectAuthState,
  selectCurrentUser,
  selectToken,
  selectIsLoggedIn,
  selectUserRole,
  selectAuthLoading,
  selectAuthError,
} from './auth.selectors';
import { AuthState } from './auth.state';

describe('Auth Selectors', () => {
  const loggedInState: { auth: AuthState } = {
    auth: {
      user: { id: 1, userHandle: 'John', email: 'john@example.com', role: 'EMPLOYEE' },
      token: 'some-token',
      isLoggedIn: true,
      loading: false,
      error: null,
    },
  };

  const loggedOutState: { auth: AuthState } = {
    auth: {
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,
      error: 'Invalid credentials',
    },
  };

  it('selectAuthState should return the auth feature state', () => {
    expect(selectAuthState(loggedInState)).toEqual(loggedInState.auth);
  });

  it('selectCurrentUser should return the user when logged in', () => {
    expect(selectCurrentUser(loggedInState)).toEqual(loggedInState.auth.user);
  });

  it('selectCurrentUser should return null when logged out', () => {
    expect(selectCurrentUser(loggedOutState)).toBeNull();
  });

  it('selectToken should return the token', () => {
    expect(selectToken(loggedInState)).toBe('some-token');
  });

  it('selectToken should return null when there is no token', () => {
    expect(selectToken(loggedOutState)).toBeNull();
  });

  it('selectIsLoggedIn should return true when logged in', () => {
    expect(selectIsLoggedIn(loggedInState)).toBe(true);
  });

  it('selectIsLoggedIn should return false when logged out', () => {
    expect(selectIsLoggedIn(loggedOutState)).toBe(false);
  });

  it('selectUserRole should return the role of the current user', () => {
    expect(selectUserRole(loggedInState)).toBe('EMPLOYEE');
  });

  it('selectUserRole should return null when there is no user', () => {
    expect(selectUserRole(loggedOutState)).toBeNull();
  });

  it('selectAuthLoading should return the loading flag', () => {
    const state = { auth: { ...loggedInState.auth, loading: true } };
    expect(selectAuthLoading(state)).toBe(true);
  });

  it('selectAuthError should return the error message', () => {
    expect(selectAuthError(loggedOutState)).toBe('Invalid credentials');
  });

  it('selectAuthError should return null when there is no error', () => {
    expect(selectAuthError(loggedInState)).toBeNull();
  });
});