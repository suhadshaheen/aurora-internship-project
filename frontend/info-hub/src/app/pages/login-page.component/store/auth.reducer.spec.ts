import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getInitialAuthState } from './auth.reducer';
import { initialAuthState } from './auth.state';

describe('getInitialAuthState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('restores the saved user and token from localStorage', () => {
    const storedUser = {
      id: 1,
      userName: 'Alice',
      email: 'alice@auroratech.ps',
      role: 'employee' as const,
    };

    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(storedUser));

    const state = getInitialAuthState();

    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toEqual(storedUser);
    expect(state.token).toBe('fake-token');
  });

  it('returns the default unauthenticated state when nothing is saved', () => {
    const state = getInitialAuthState();

    expect(state).toEqual(initialAuthState);
  });
});
