import { ICategory } from '../../../../../../models/category.interface';
import { createAction, props } from '@ngrx/store';

export const CategoryActions = {
  loadCategories: createAction('[Category] Load Categories'),
  loadCategoriesSuccess: createAction(
    '[Category] Load Categories Success',
    props<{ categories: ICategory[] }>(),
  ),
  loadCategoriesFailure: createAction(
    '[Category] Load Categories Failure',
    props<{ error: string }>(),
  ),

  addCategory: createAction(
    '[Category] Add Category',
    props<{ category: Omit<ICategory, 'catId' | 'dateCreated'> }>(),
  ),
  addCategorySuccess: createAction(
    '[Category] Add Category Success',
    props<{ category: ICategory }>(),
  ),
  addCategoryFailure: createAction('[Category] Add Category Failure', props<{ error: string }>()),

  deleteCategory: createAction('[Category] Delete Category', props<{ catId: string }>()),
  deleteCategorySuccess: createAction(
    '[Category] Delete Category Success',
    props<{ catId: string }>(),
  ),
  deleteCategoryFailure: createAction(
    '[Category] Delete Category Failure',
    props<{ error: string }>(),
  ),
};
