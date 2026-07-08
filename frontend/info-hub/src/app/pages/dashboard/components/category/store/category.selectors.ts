import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ICategoryState } from './category.reducer';

export const selectCategoryState = createFeatureSelector<ICategoryState>('category');

export const selectCategories = createSelector(
  selectCategoryState,
  (state: ICategoryState) => state.categories,
);

export const selectCategoryLoading = createSelector(
  selectCategoryState,
  (state: ICategoryState) => state.loading,
);

export const selectCategoryError = createSelector(
  selectCategoryState,
  (state: ICategoryState) => state.error,
);
