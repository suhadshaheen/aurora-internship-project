import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { UserActions } from './user.actions';
import { UserService } from '../services/user.service';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      mergeMap(() =>
        this.userService.getAllUsers().pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) =>
            of(
              UserActions.loadUsersFailure({
                error: error.error?.message ?? 'Failed to load users',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.addUser),
      mergeMap(({ user }) =>
        this.userService.addUser(user).pipe(
          map((created) => UserActions.addUserSuccess({ user: created })),
          catchError((error) =>
            of(UserActions.addUserFailure({ error: error.error?.message ?? 'Failed to add user' })),
          ),
        ),
      ),
    ),
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) =>
        this.userService.deleteUser(id).pipe(
          mergeMap(() => [UserActions.deleteUserSuccess({ id }), UserActions.loadUsers()]),
          catchError((error) =>
            of(
              UserActions.deleteUserFailure({
                error: error.error?.message ?? 'Failed to delete user',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
