import { ICategory } from '../../../../../../models/category.interface';
import { createAction, props } from '@ngrx/store';
import { ICategoryRequest } from '../../../../../../models/CategoryRequest.interface';
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

  addCategory: createAction('[Category] Add Category', props<{ category: ICategoryRequest }>()),
  addCategorySuccess: createAction(
    '[Category] Add Category Success',
    props<{ category: ICategory }>(),
  ),
  addCategoryFailure: createAction('[Category] Add Category Failure', props<{ error: string }>()),

  deleteCategory: createAction('[Category] Delete Category', props<{ id: number }>()),
  deleteCategorySuccess: createAction(
    '[Category] Delete Category Success',
    props<{ id: number }>(),
  ),
  deleteCategoryFailure: createAction(
    '[Category] Delete Category Failure',
    props<{ error: string }>(),
  ),
};
