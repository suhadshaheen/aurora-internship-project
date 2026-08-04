import { createReducer, on } from '@ngrx/store';
import { UserActions } from './user.actions';
import { IUser } from '../../../models/user.interface';

export interface UserState {
  users: IUser[];
  loading: boolean;
  error: string | null;
}

export const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.addUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.addUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
    loading: false,
  })),
  on(UserActions.addUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.deleteUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.filter((u) => u.id !== id),
  })),
  on(UserActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
