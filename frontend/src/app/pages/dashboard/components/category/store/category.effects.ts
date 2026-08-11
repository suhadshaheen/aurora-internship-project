import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { CategoryActions } from './category.actions';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private categoryService = inject(CategoryService);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadCategories),
      mergeMap(() =>
        this.categoryService.getAll().pipe(
          map((categories) => CategoryActions.loadCategoriesSuccess({ categories })),
          catchError((error) =>
            of(CategoryActions.loadCategoriesFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  addCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.addCategory),
      mergeMap(({ category }) =>
        this.categoryService.create(category).pipe(
          map((createdCategory) =>
            CategoryActions.addCategorySuccess({ category: createdCategory }),
          ),
          catchError((error) => of(CategoryActions.addCategoryFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.deleteCategory),
      mergeMap(({ id }) =>
        this.categoryService.delete(id).pipe(
          map(() => CategoryActions.deleteCategorySuccess({ id })),
          catchError((error) =>
            of(CategoryActions.deleteCategoryFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
