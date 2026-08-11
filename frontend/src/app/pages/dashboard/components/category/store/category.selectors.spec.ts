import { selectCategories, selectCategoryLoading, selectCategoryError } from './category.selectors';
import { ICategoryState } from './category.reducer';
import { ICategory } from '../../../../../../models/category.interface';

describe('Category Selectors', () => {
  const mockCategory: ICategory = {
    id: 1,
    catName: 'FrontEnd',
    dateCreated: '2026-08-01T10:30:00',
    createdBy: { id: 1, userHandle: 'suhad_sh', role: 'ADMIN' },
  };

  const state: { category: ICategoryState } = {
    category: {
      categories: [mockCategory],
      loading: true,
      error: 'some error',
    },
  };

  it('should select the categories array', () => {
    expect(selectCategories(state)).toEqual([mockCategory]);
  });

  it('should select the loading flag', () => {
    expect(selectCategoryLoading(state)).toBe(true);
  });

  it('should select the error message', () => {
    expect(selectCategoryError(state)).toBe('some error');
  });

  it('should return null for error when there is none', () => {
    const cleanState = {
      category: { categories: [], loading: false, error: null },
    };

    expect(selectCategoryError(cleanState)).toBeNull();
  });
});
