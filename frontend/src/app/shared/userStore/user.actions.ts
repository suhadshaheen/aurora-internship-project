import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IUserRequest } from '../../../models/userRequest.interface';
import { IUser } from '../../../models/user.interface';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: IUser[] }>(),
    'Load Users Failure': props<{ error: string }>(),

    'Add User': props<{ user: IUserRequest }>(),
    'Add User Success': props<{ user: IUser }>(),
    'Add User Failure': props<{ error: string }>(),

    'Delete User': props<{ id: number }>(),
    'Delete User Success': props<{ id: number }>(),
    'Delete User Failure': props<{ error: string }>(),
  },
});
