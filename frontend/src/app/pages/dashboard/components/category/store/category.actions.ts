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

  // TODO(TEMP-ID-RENAME): رجّع 'id' لـ 'catId' جوا الـ Omit
  addCategory: createAction(
    '[Category] Add Category',
    props<{ category: Omit<ICategory, 'id' | 'dateCreated'> }>(),
  ),
  addCategorySuccess: createAction(
    '[Category] Add Category Success',
    props<{ category: ICategory }>(),
  ),
  addCategoryFailure: createAction('[Category] Add Category Failure', props<{ error: string }>()),

  // TODO(TEMP-ID-RENAME): رجّع catId مكان id
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
