import { authReducer, getInitialAuthState } from './auth.reducer';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

describe('getInitialAuthState()', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should return initialAuthState when localStorage has no token/user', () => {
    localStorage.clear();

    const result = getInitialAuthState();

    expect(result).toEqual(initialAuthState);
  });

  it('should return initialAuthState when only token exists but no user', () => {
    localStorage.setItem('token', 'some-token');

    const result = getInitialAuthState();

    expect(result).toEqual(initialAuthState);
  });

  it('should return initialAuthState when only user exists but no token', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'a@b.com' }));

    const result = getInitialAuthState();

    expect(result).toEqual(initialAuthState);
  });

  it('should return a logged-in state built from a valid stored token and user', () => {
    const storedUser = { id: 1, userHandle: 'John', email: 'john@example.com', role: 'EMPLOYEE' };
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify(storedUser));

    const result = getInitialAuthState();

    expect(result).toEqual({
      user: storedUser,
      token: 'valid-token',
      isLoggedIn: true,
      loading: false,
      error: null,
    });
  });

  it('should return initialAuthState when the stored user JSON is malformed', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', '{not-valid-json');

    const result = getInitialAuthState();

    expect(result).toEqual(initialAuthState);
  });
});

describe('authReducer', () => {
  // We start every test from an explicit, known state rather than
  // `undefined`, since the reducer's real initial state is computed once
  // at module-import time from localStorage (via getInitialAuthState()) and
  // is not something a single test can reliably control.
  const baseState: AuthState = {
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
    error: null,
  };

  it('login should set loading=true and clear any previous error', () => {
    const state: AuthState = { ...baseState, error: 'previous error' };

    const result = authReducer(
      state,
      AuthActions.login({ email: 'a@b.com', password: '123456' }),
    );

    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('loginSuccess should set user, token, isLoggedIn=true, loading=false, and clear error', () => {
    const user = { id: 1, userHandle: 'John', email: 'john@example.com', role: 'EMPLOYEE' as const };
    const state: AuthState = { ...baseState, loading: true, error: 'previous error' };

    const result = authReducer(
      state,
      AuthActions.loginSuccess({ user, token: 'new-token' }),
    );

    expect(result.user).toEqual(user);
    expect(result.token).toBe('new-token');
    expect(result.isLoggedIn).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('loginFailure should set the error and loading=false', () => {
    const state: AuthState = { ...baseState, loading: true };

    const result = authReducer(
      state,
      AuthActions.loginFailure({ error: 'Invalid credentials' }),
    );

    expect(result.error).toBe('Invalid credentials');
    expect(result.loading).toBe(false);
  });

  it('continueAsGuest should set a guest user, guest token, and isLoggedIn=true', () => {
    const result = authReducer(baseState, AuthActions.continueAsGuest());

    expect(result.user).toEqual({
      id: 0,
      email: 'guest@auroratech.ps',
      userHandle: 'Guest',
      role: 'GUEST',
    });
    expect(result.token).toBe('guest-token');
    expect(result.isLoggedIn).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('logout should reset the state back to initialAuthState', () => {
    const loggedInState: AuthState = {
      user: { id: 1, userHandle: 'John', email: 'john@example.com', role: 'EMPLOYEE' },
      token: 'some-token',
      isLoggedIn: true,
      loading: false,
      error: null,
    };

    const result = authReducer(loggedInState, AuthActions.logout());

    expect(result).toEqual(initialAuthState);
  });

  it('clearError should reset only the error field, leaving the rest untouched', () => {
    const state: AuthState = {
      user: { id: 1, userHandle: 'John', email: 'john@example.com', role: 'EMPLOYEE' },
      token: 'some-token',
      isLoggedIn: true,
      loading: false,
      error: 'some error',
    };

    const result = authReducer(state, AuthActions.clearError());

    expect(result.error).toBeNull();
    expect(result.user).toEqual(state.user);
    expect(result.token).toBe(state.token);
    expect(result.isLoggedIn).toBe(true);
  });
});