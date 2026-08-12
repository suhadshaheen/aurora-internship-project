import { selectUserState, selectAllUsers, selectUsersLoading, selectUsersError } from './user.selectors';
import { UserState } from './user.reducer';
import { IUser } from '../../../models/user.interface';

describe('User Selectors', () => {
  const makeUser = (overrides: Partial<IUser> = {}): IUser =>
    ({
      id: 1,
      userHandle: 'john',
      email: 'john@example.com',
      role: 'EMPLOYEE',
      deleted: false,
      ...overrides,
    }) as IUser;

  const mockState: { users: UserState } = {
    users: {
      users: [makeUser({ id: 1 }), makeUser({ id: 2 })],
      loading: true,
      error: 'some error',
    },
  };

  it('selectUserState should return the user feature state', () => {
    expect(selectUserState(mockState)).toEqual(mockState.users);
  });

  it('selectAllUsers should return the users array', () => {
    expect(selectAllUsers(mockState)).toEqual(mockState.users.users);
  });

  it('selectAllUsers should return an empty array when there are no users', () => {
    const state = { users: { ...mockState.users, users: [] } };
    expect(selectAllUsers(state)).toEqual([]);
  });

  it('selectUsersLoading should return the loading flag', () => {
    expect(selectUsersLoading(mockState)).toBe(true);
  });

  it('selectUsersError should return the error message', () => {
    expect(selectUsersError(mockState)).toBe('some error');
  });

  it('selectUsersError should return null when there is no error', () => {
    const state = { users: { ...mockState.users, error: null } };
    expect(selectUsersError(state)).toBeNull();
  });
});