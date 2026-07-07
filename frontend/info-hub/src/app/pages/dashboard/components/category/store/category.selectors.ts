import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';

export const selectCategoryState = createFeatureSelector<CategoryState>('category');

export const selectCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories,
);

export const selectCategoryLoading = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.loading,
);

export const selectCategoryError = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.error,
);
