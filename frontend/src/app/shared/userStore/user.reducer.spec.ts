import { userReducer, UserState, initialState } from './user.reducer';
import { UserActions } from './user.actions';
import { IUser } from '../../../models/user.interface';
import { IUserRequest } from '../../../models/userRequest.interface';

describe('userReducer', () => {
  const makeUser = (overrides: Partial<IUser> = {}): IUser =>
    ({
      id: 1,
      userHandle: 'john',
      email: 'john@example.com',
      role: 'EMPLOYEE',
      deleted: false,
      ...overrides,
    }) as IUser;

  it('should return the initial state for an unknown action', () => {
    const result = userReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(result).toEqual(initialState);
  });

  describe('loadUsers', () => {
    it('should set loading=true and clear error', () => {
      const state: UserState = { ...initialState, error: 'previous error' };
      const result = userReducer(state, UserActions.loadUsers());

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('loadUsersSuccess should set the users list and loading=false', () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      const state: UserState = { ...initialState, loading: true };

      const result = userReducer(state, UserActions.loadUsersSuccess({ users }));

      expect(result.users).toEqual(users);
      expect(result.loading).toBe(false);
    });

    it('loadUsersFailure should set loading=false and store the error', () => {
      const state: UserState = { ...initialState, loading: true };

      const result = userReducer(
        state,
        UserActions.loadUsersFailure({ error: 'Failed to load' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Failed to load');
    });
  });

  describe('addUser', () => {
    it('should set loading=true and clear error', () => {
      const state: UserState = { ...initialState, error: 'previous error' };
      const request = {} as IUserRequest;

      const result = userReducer(state, UserActions.addUser({ user: request }));

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('addUserSuccess should append the new user and set loading=false', () => {
      const existing = makeUser({ id: 1 });
      const newUser = makeUser({ id: 2 });

      const state: UserState = { ...initialState, users: [existing], loading: true };
      const result = userReducer(state, UserActions.addUserSuccess({ user: newUser }));

      expect(result.loading).toBe(false);
      expect(result.users).toEqual([existing, newUser]);
    });

    it('addUserFailure should set loading=false and store the error', () => {
      const state: UserState = { ...initialState, loading: true };

      const result = userReducer(
        state,
        UserActions.addUserFailure({ error: 'Add failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Add failed');
    });
  });

  describe('deleteUser', () => {
    it('should set loading=true and clear error', () => {
      const state: UserState = { ...initialState, error: 'previous error' };

      const result = userReducer(state, UserActions.deleteUser({ id: 1 }));

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deleteUserSuccess should remove the user with the matching id and set loading=false', () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      const state: UserState = { ...initialState, users, loading: true };

      const result = userReducer(state, UserActions.deleteUserSuccess({ id: 1 }));

      expect(result.loading).toBe(false);
      expect(result.users.map((u) => u.id)).toEqual([2]);
    });

    it('deleteUserSuccess should leave the list unchanged if the id does not match any user', () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      const state: UserState = { ...initialState, users, loading: true };

      const result = userReducer(state, UserActions.deleteUserSuccess({ id: 999 }));

      expect(result.users.map((u) => u.id)).toEqual([1, 2]);
    });

    it('deleteUserFailure should set loading=false and store the error', () => {
      const state: UserState = { ...initialState, loading: true };

      const result = userReducer(
        state,
        UserActions.deleteUserFailure({ error: 'Delete failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Delete failed');
    });

    it('deleteUserFailure should NOT modify the users list', () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      const state: UserState = { ...initialState, users, loading: true };

      const result = userReducer(
        state,
        UserActions.deleteUserFailure({ error: 'Delete failed' }),
      );

      expect(result.users).toEqual(users);
    });
  });
});