import { createReducer, on } from '@ngrx/store';
import { ICategory } from '../../../../../../models/category.interface';
import * as CategoryActions from './category.actions';

export interface ICategoryState {
  categories: ICategory[];

  loading: boolean;
  error: string | null;
}

export const initialCategoryState: ICategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const categoryReducer = createReducer(
  initialCategoryState,
  on(CategoryActions.CategoryActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CategoryActions.CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
    error: null,
  })),
  on(CategoryActions.CategoryActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(CategoryActions.CategoryActions.addCategory, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CategoryActions.CategoryActions.addCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    loading: false,
    error: null,
  })),
  on(CategoryActions.CategoryActions.addCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(CategoryActions.CategoryActions.deleteCategory, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CategoryActions.CategoryActions.deleteCategorySuccess, (state, { catId }) => ({
    ...state,
    categories: state.categories.filter((category) => category.catId !== catId),
    loading: false,
    error: null,
  })),
  on(CategoryActions.CategoryActions.deleteCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
