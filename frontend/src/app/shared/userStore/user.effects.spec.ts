import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom, toArray, take } from 'rxjs';

import { UserEffects } from './user.effects';
import { UserActions } from './user.actions';
import { UserService } from '../services/user.service';
import { IUser } from '../../../models/user.interface';
import { IUserRequest } from '../../../models/userRequest.interface';

describe('UserEffects', () => {
  let effects: UserEffects;
  let actions$: Observable<any>;
  let userServiceMock: {
    getAllUsers: jest.Mock;
    addUser: jest.Mock;
    deleteUser: jest.Mock;
  };

  const makeUser = (overrides: Partial<IUser> = {}): IUser =>
    ({
      id: 1,
      userHandle: 'john',
      email: 'john@example.com',
      role: 'EMPLOYEE',
      deleted: false,
      ...overrides,
    }) as IUser;

  beforeEach(() => {
    userServiceMock = {
      getAllUsers: jest.fn(),
      addUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        { provide: UserService, useValue: userServiceMock },
      ],
    });

    effects = TestBed.inject(UserEffects);
  });

  describe('loadUsers$', () => {
    it('should dispatch loadUsersSuccess with the users on success', async () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      userServiceMock.getAllUsers.mockReturnValue(of(users));

      actions$ = of(UserActions.loadUsers());

      const result = await firstValueFrom(effects.loadUsers$);

      expect(userServiceMock.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(UserActions.loadUsersSuccess({ users }));
    });

    it('should dispatch loadUsersFailure with the server error message on failure', async () => {
      userServiceMock.getAllUsers.mockReturnValue(
        throwError(() => ({ error: { message: 'Server exploded' } })),
      );

      actions$ = of(UserActions.loadUsers());

      const result = await firstValueFrom(effects.loadUsers$);

      expect(result).toEqual(UserActions.loadUsersFailure({ error: 'Server exploded' }));
    });

    it('should fall back to a generic message when the error has no message', async () => {
      userServiceMock.getAllUsers.mockReturnValue(throwError(() => ({})));

      actions$ = of(UserActions.loadUsers());

      const result = await firstValueFrom(effects.loadUsers$);

      expect(result).toEqual(
        UserActions.loadUsersFailure({ error: 'Failed to load users' }),
      );
    });
  });

  describe('addUser$', () => {
    it('should call the service and dispatch addUserSuccess with the created user', async () => {
      const request = { userHandle: 'newuser' } as IUserRequest;
      const createdUser = makeUser({ id: 10, userHandle: 'newuser' });
      userServiceMock.addUser.mockReturnValue(of(createdUser));

      actions$ = of(UserActions.addUser({ user: request }));

      const result = await firstValueFrom(effects.addUser$);

      expect(userServiceMock.addUser).toHaveBeenCalledWith(request);
      expect(result).toEqual(UserActions.addUserSuccess({ user: createdUser }));
    });

    it('should dispatch addUserFailure with the server error message on failure', async () => {
      userServiceMock.addUser.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already exists' } })),
      );

      actions$ = of(UserActions.addUser({ user: {} as IUserRequest }));

      const result = await firstValueFrom(effects.addUser$);

      expect(result).toEqual(
        UserActions.addUserFailure({ error: 'Email already exists' }),
      );
    });

    it('should fall back to a generic message when the error has no message', async () => {
      userServiceMock.addUser.mockReturnValue(throwError(() => ({})));

      actions$ = of(UserActions.addUser({ user: {} as IUserRequest }));

      const result = await firstValueFrom(effects.addUser$);

      expect(result).toEqual(UserActions.addUserFailure({ error: 'Failed to add user' }));
    });
  });

  describe('deleteUser$', () => {
    it('should call the service and dispatch BOTH deleteUserSuccess and loadUsers on success', async () => {
      userServiceMock.deleteUser.mockReturnValue(of(undefined));

      actions$ = of(UserActions.deleteUser({ id: 5 }));

      const results = await firstValueFrom(effects.deleteUser$.pipe(toArray()));

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(5);
      expect(results).toEqual([
        UserActions.deleteUserSuccess({ id: 5 }),
        UserActions.loadUsers(),
      ]);
    });

    it('should dispatch deleteUserFailure with the server error message on failure', async () => {
      userServiceMock.deleteUser.mockReturnValue(
        throwError(() => ({ error: { message: 'User not found' } })),
      );

      actions$ = of(UserActions.deleteUser({ id: 999 }));

      const result = await firstValueFrom(effects.deleteUser$);

      expect(result).toEqual(
        UserActions.deleteUserFailure({ error: 'User not found' }),
      );
    });

    it('should fall back to a generic message when the error has no message', async () => {
      userServiceMock.deleteUser.mockReturnValue(throwError(() => ({})));

      actions$ = of(UserActions.deleteUser({ id: 1 }));

      const result = await firstValueFrom(effects.deleteUser$);

      expect(result).toEqual(
        UserActions.deleteUserFailure({ error: 'Failed to delete user' }),
      );
    });
  });
});