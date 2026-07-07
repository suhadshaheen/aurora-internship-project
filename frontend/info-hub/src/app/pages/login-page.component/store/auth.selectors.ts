import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';
import { authFeatureKey } from './auth.reducer';

export const selectAuthState =
  createFeatureSelector<AuthState>(authFeatureKey);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state) => state.isLoggedIn
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.user?.role ?? null
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);