import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { CategoryEffects } from './category.effects';
import { CategoryActions } from './category.actions';
import { CategoryService } from '../services/category.service';
import { ICategory } from '../../../../../../models/category.interface';

describe('CategoryEffects', () => {
  let effects: CategoryEffects;
  let actions$: Observable<any>;
  let categoryServiceMock: {
    getAll: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  const mockCategory: ICategory = {
    id: 1,
    catName: 'Backend',
    dateCreated: '2026-08-01T10:30:00',
    createdBy: { id: 1, userHandle: 'suhad_sh', role: 'ADMIN' },
  };

  beforeEach(() => {
    categoryServiceMock = {
      getAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoryEffects,
        provideMockActions(() => actions$),
        { provide: CategoryService, useValue: categoryServiceMock },
      ],
    });

    effects = TestBed.inject(CategoryEffects);
  });

  describe('loadCategories$', () => {
    it('should dispatch loadCategoriesSuccess on successful load', (done) => {
      categoryServiceMock.getAll.mockReturnValue(of([mockCategory]));
      actions$ = of(CategoryActions.loadCategories());

      effects.loadCategories$.subscribe((action) => {
        expect(action).toEqual(
          CategoryActions.loadCategoriesSuccess({ categories: [mockCategory] }),
        );
        done();
      });
    });

    it('should dispatch loadCategoriesFailure on error', (done) => {
      categoryServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));
      actions$ = of(CategoryActions.loadCategories());

      effects.loadCategories$.subscribe((action) => {
        expect(action).toEqual(CategoryActions.loadCategoriesFailure({ error: 'Network error' }));
        done();
      });
    });
  });

  describe('addCategory$', () => {
    it('should dispatch addCategorySuccess on successful creation', (done) => {
      categoryServiceMock.create.mockReturnValue(of(mockCategory));
      actions$ = of(CategoryActions.addCategory({ category: { catName: 'Networking' } }));

      effects.addCategory$.subscribe((action) => {
        expect(action).toEqual(CategoryActions.addCategorySuccess({ category: mockCategory }));
        done();
      });
    });

    it('should dispatch addCategoryFailure on error', (done) => {
      categoryServiceMock.create.mockReturnValue(
        throwError(() => new Error('Category already exists')),
      );
      actions$ = of(CategoryActions.addCategory({ category: { catName: 'Networking' } }));

      effects.addCategory$.subscribe((action) => {
        expect(action).toEqual(
          CategoryActions.addCategoryFailure({ error: 'Category already exists' }),
        );
        done();
      });
    });
  });

  describe('deleteCategory$', () => {
    it('should dispatch deleteCategorySuccess on successful deletion', (done) => {
      categoryServiceMock.delete.mockReturnValue(of(undefined));
      actions$ = of(CategoryActions.deleteCategory({ id: 1 }));

      effects.deleteCategory$.subscribe((action) => {
        expect(action).toEqual(CategoryActions.deleteCategorySuccess({ id: 1 }));
        done();
      });
    });

    it('should dispatch deleteCategoryFailure on error', (done) => {
      categoryServiceMock.delete.mockReturnValue(
        throwError(() => new Error('Cannot delete category with linked sections')),
      );
      actions$ = of(CategoryActions.deleteCategory({ id: 1 }));

      effects.deleteCategory$.subscribe((action) => {
        expect(action).toEqual(
          CategoryActions.deleteCategoryFailure({
            error: 'Cannot delete category with linked sections',
          }),
        );
        done();
      });
    });
  });
});
