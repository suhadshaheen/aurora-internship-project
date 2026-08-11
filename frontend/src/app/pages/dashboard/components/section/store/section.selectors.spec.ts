import {
  selectSectionState,
  selectAllSections,
  selectSelectedSection,
  selectSectionLoading,
  selectSectionError,
  selectSectionsByCategoryId,
  selectSectionsByUserId,
} from './section.selectors';
import { ISectionState } from './section.reducer';
import { ISection } from '../../../../../../models/section.interface';

describe('Section Selectors', () => {
  const makeSection = (overrides: Partial<ISection> = {}): ISection =>
    ({
      id: 1,
      title: 'Title',
      content: 'Content',
      visibility: true,
      important: false,
      createdAt: new Date().toISOString(),
      createdBy: { id: 1 },
      category: { id: 1, catName: 'General' },
      documents: [],
      ...overrides,
    }) as unknown as ISection;

  const sectionA = makeSection({ id: 1, category: { id: 10, catName: 'Cat A' } as any, createdBy: { id: 100 } as any });
  const sectionB = makeSection({ id: 2, category: { id: 20, catName: 'Cat B' } as any, createdBy: { id: 200 } as any });
  const sectionC = makeSection({ id: 3, category: { id: 10, catName: 'Cat A' } as any, createdBy: { id: 100 } as any });

  const mockState: { section: ISectionState } = {
    section: {
      sections: [sectionA, sectionB, sectionC],
      selectedSection: sectionB,
      loading: true,
      error: 'some error',
    },
  };

  it('selectSectionState should return the section feature state', () => {
    expect(selectSectionState(mockState)).toEqual(mockState.section);
  });

  it('selectAllSections should return the sections array', () => {
    expect(selectAllSections(mockState)).toEqual([sectionA, sectionB, sectionC]);
  });

  it('selectSelectedSection should return the selected section', () => {
    expect(selectSelectedSection(mockState)).toEqual(sectionB);
  });

  it('selectSelectedSection should return null when nothing is selected', () => {
    const state = { section: { ...mockState.section, selectedSection: null } };
    expect(selectSelectedSection(state)).toBeNull();
  });

  it('selectSectionLoading should return the loading flag', () => {
    expect(selectSectionLoading(mockState)).toBe(true);
  });

  it('selectSectionError should return the error message', () => {
    expect(selectSectionError(mockState)).toBe('some error');
  });

  it('selectSectionError should return null when there is no error', () => {
    const state = { section: { ...mockState.section, error: null } };
    expect(selectSectionError(state)).toBeNull();
  });

  describe('selectSectionsByCategoryId', () => {
    it('should return only sections belonging to the given category id', () => {
      const selector = selectSectionsByCategoryId(10);
      const result = selector(mockState);

      expect(result.map((s) => s.id)).toEqual([1, 3]);
    });

    it('should return an empty array when no sections match the category id', () => {
      const selector = selectSectionsByCategoryId(999);
      const result = selector(mockState);

      expect(result).toEqual([]);
    });
  });

  describe('selectSectionsByUserId', () => {
    it('should return only sections created by the given user id', () => {
      const selector = selectSectionsByUserId(100);
      const result = selector(mockState);

      expect(result.map((s) => s.id)).toEqual([1, 3]);
    });

    it('should return an empty array when no sections match the user id', () => {
      const selector = selectSectionsByUserId(999);
      const result = selector(mockState);

      expect(result).toEqual([]);
    });
  });
});