import { CategoryActions } from './category.actions';
import { categoryReducer, ICategoryState, initialCategoryState } from './category.reducer';
import { ICategory } from '../../../../../../models/category.interface';

describe('categoryReducer', () => {
  const mockCategory: ICategory = {
    id: 1,
    catName: 'QA',
    dateCreated: '2026-08-01T10:30:00',
    createdBy: { id: 1, userHandle: 'suhad_sh', role: 'ADMIN' },
  };
  const mockCategory2: ICategory = {
    id: 2,
    catName: 'DevOps',
    dateCreated: '2026-08-02T14:15:00',
    createdBy: { id: 1, userHandle: 'suhad_sh', role: 'ADMIN' },
  };
  it('should return the initial state for an unknown action', () => {
    const action = { type: 'UNKNOWN' };
    const state = categoryReducer(initialCategoryState, action as any);

    expect(state).toBe(initialCategoryState);
  });
  describe('loadCategories', () => {
    it('should set loading to true and clear error', () => {
      const startState: ICategoryState = {
        ...initialCategoryState,
        error: 'Previous error',
      };
      const state = categoryReducer(startState, CategoryActions.loadCategories());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });
  it('should set categories and loading false on success', () => {
    const startState: ICategoryState = { ...initialCategoryState, loading: true };

    const state = categoryReducer(
      startState,
      CategoryActions.loadCategoriesSuccess({ categories: [mockCategory, mockCategory2] }),
    );

    expect(state.categories).toEqual([mockCategory, mockCategory2]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
  it('should set error and loading false on failure', () => {
    const startState: ICategoryState = { ...initialCategoryState, loading: true };

    const state = categoryReducer(
      startState,
      CategoryActions.loadCategoriesFailure({ error: 'Failed to load' }),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load');
    expect(state.categories).toEqual([]);
  });
  describe('addCategory', () => {
    it('should set loading to true and clear error', () => {
      const startState: ICategoryState = { ...initialCategoryState, error: 'old error' };

      const state = categoryReducer(
        startState,
        CategoryActions.addCategory({ category: { catName: 'QA' } }),
      );

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should append the new category and set loading false on success', () => {
      const startState: ICategoryState = {
        ...initialCategoryState,
        categories: [mockCategory],
        loading: true,
      };

      const state = categoryReducer(
        startState,
        CategoryActions.addCategorySuccess({ category: mockCategory2 }),
      );

      expect(state.categories).toEqual([mockCategory, mockCategory2]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error and loading false on failure', () => {
      const startState: ICategoryState = { ...initialCategoryState, loading: true };

      const state = categoryReducer(
        startState,
        CategoryActions.addCategoryFailure({ error: 'Category already exists' }),
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Category already exists');
    });
  });
  describe('deleteCategory', () => {
    it('should set loading to true and clear error', () => {
      const startState: ICategoryState = { ...initialCategoryState, error: 'old error' };

      const state = categoryReducer(startState, CategoryActions.deleteCategory({ id: 1 }));

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
    it('should remove the category with the matching id on success', () => {
      const startState: ICategoryState = {
        ...initialCategoryState,
        categories: [mockCategory, mockCategory2],
        loading: true,
      };

      const state = categoryReducer(
        startState,
        CategoryActions.deleteCategorySuccess({ id: mockCategory.id }),
      );

      expect(state.categories).toEqual([mockCategory2]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    it('should not remove any category when the id does not match', () => {
      const startState: ICategoryState = {
        ...initialCategoryState,
        categories: [mockCategory, mockCategory2],
        loading: true,
      };

      const state = categoryReducer(startState, CategoryActions.deleteCategorySuccess({ id: 999 }));

      expect(state.categories).toEqual([mockCategory, mockCategory2]);
    });
    it('should set error and loading false on failure', () => {
      const startState: ICategoryState = { ...initialCategoryState, loading: true };

      const state = categoryReducer(
        startState,
        CategoryActions.deleteCategoryFailure({ error: 'Cannot delete category' }),
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Cannot delete category');
    });
  });
});
