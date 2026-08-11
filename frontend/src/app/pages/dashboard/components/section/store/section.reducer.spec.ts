import { sectionReducer, ISectionState } from './section.reducer';
import { SectionActions } from './section.actions';
import { ISection } from '../../../../../../models/section.interface';

describe('sectionReducer', () => {
  const initialState: ISectionState = {
    sections: [],
    selectedSection: null,
    loading: false,
    error: null,
  };

  const makeSection = (overrides: Partial<ISection> = {}): ISection =>
    ({
      id: 1,
      title: 'Title',
      content: 'Content',
      visibility: true,
      important: false,
      createdAt: new Date('2024-01-01').toISOString(),
      createdBy: { id: 1 },
      category: { id: 1, catName: 'General' },
      documents: [],
      ...overrides,
    }) as unknown as ISection;

  it('should return the initial state for an unknown action', () => {
    const action = { type: 'UNKNOWN' } as any;
    const result = sectionReducer(undefined, action);

    expect(result).toEqual(initialState);
  });

  describe('loadSections', () => {
    it('should set loading=true and clear error', () => {
      const state: ISectionState = { ...initialState, error: 'previous error' };
      const result = sectionReducer(state, SectionActions.loadSections());

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('loadSectionsSuccess should set loading=false and store sections as-is', () => {
      const sections = [makeSection({ id: 1 }), makeSection({ id: 2 })];
      const state: ISectionState = { ...initialState, loading: true };

      const result = sectionReducer(state, SectionActions.loadSectionsSuccess({ sections }));

      expect(result.loading).toBe(false);
      expect(result.sections).toEqual(sections);
    });

    it('loadSectionsFailure should set loading=false and store the error', () => {
      const state: ISectionState = { ...initialState, loading: true };

      const result = sectionReducer(
        state,
        SectionActions.loadSectionsFailure({ error: 'Failed to load' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Failed to load');
    });
  });

  describe('addSection', () => {
    it('should set loading=true and clear error', () => {
      const state: ISectionState = { ...initialState, error: 'previous error' };
      const result = sectionReducer(
        state,
        SectionActions.addSection({
          title: 't',
          content: 'c',
          categoryId: 1,
          visibility: true,
        }),
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('addSectionSuccess should prepend the new section and re-sort', () => {
      const existing = makeSection({
        id: 1,
        important: false,
        createdAt: new Date('2024-01-01').toISOString(),
      });
      const newSection = makeSection({
        id: 2,
        important: false,
        createdAt: new Date('2024-06-01').toISOString(),
      });

      const state: ISectionState = { ...initialState, sections: [existing], loading: true };
      const result = sectionReducer(
        state,
        SectionActions.addSectionSuccess({ section: newSection }),
      );

      expect(result.loading).toBe(false);
      // newer, same importance -> should come first
      expect(result.sections.map((s) => s.id)).toEqual([2, 1]);
    });

    it('addSectionFailure should set loading=false and store the error', () => {
      const state: ISectionState = { ...initialState, loading: true };
      const result = sectionReducer(
        state,
        SectionActions.addSectionFailure({ error: 'Add failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Add failed');
    });
  });

  describe('deleteSection', () => {
    it('should set loading=true and clear error', () => {
      const state: ISectionState = { ...initialState, error: 'previous error' };
      const result = sectionReducer(state, SectionActions.deleteSection({ sectionId: 1 }));

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deleteSectionSuccess should remove the section with the matching id', () => {
      const sections = [makeSection({ id: 1 }), makeSection({ id: 2 })];
      const state: ISectionState = { ...initialState, sections, loading: true };

      const result = sectionReducer(
        state,
        SectionActions.deleteSectionSuccess({ sectionId: 1 }),
      );

      expect(result.loading).toBe(false);
      expect(result.sections.map((s) => s.id)).toEqual([2]);
    });

    it('deleteSectionFailure should set loading=false and store the error', () => {
      const state: ISectionState = { ...initialState, loading: true };
      const result = sectionReducer(
        state,
        SectionActions.deleteSectionFailure({ error: 'Delete failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('updateSection', () => {
    it('should set loading=true and clear error', () => {
      const state: ISectionState = { ...initialState, error: 'previous error' };
      const result = sectionReducer(
        state,
        SectionActions.updateSection({
          id: 1,
          title: 't',
          content: 'c',
          categoryId: 1,
          visibility: true,
        }),
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('updateSectionSuccess should replace only the matching section, preserving order', () => {
      const sections = [
        makeSection({ id: 1, title: 'Old Title 1' }),
        makeSection({ id: 2, title: 'Old Title 2' }),
      ];
      const updated = makeSection({ id: 1, title: 'New Title 1' });

      const state: ISectionState = { ...initialState, sections, loading: true };
      const result = sectionReducer(
        state,
        SectionActions.updateSectionSuccess({ section: updated }),
      );

      expect(result.loading).toBe(false);
      expect(result.sections[0].title).toBe('New Title 1');
      expect(result.sections[1].title).toBe('Old Title 2');
      expect(result.sections.map((s) => s.id)).toEqual([1, 2]);
    });

    it('updateSectionFailure should set loading=false and store the error', () => {
      const state: ISectionState = { ...initialState, loading: true };
      const result = sectionReducer(
        state,
        SectionActions.updateSectionFailure({ error: 'Update failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('selectSection', () => {
    it('should set selectedSection', () => {
      const section = makeSection({ id: 5 });
      const result = sectionReducer(initialState, SectionActions.selectSection({ section }));

      expect(result.selectedSection).toEqual(section);
    });
  });

  describe('deleteSectionDocument', () => {
    it('deleteSectionDocumentSuccess should replace the matching section with the updated one', () => {
      const sections = [
        makeSection({ id: 1, documents: [{ id: 10 } as any, { id: 20 } as any] }),
        makeSection({ id: 2 }),
      ];
      const updatedSection = makeSection({ id: 1, documents: [{ id: 20 } as any] });

      const state: ISectionState = { ...initialState, sections };
      const result = sectionReducer(
        state,
        SectionActions.deleteSectionDocumentSuccess({ section: updatedSection }),
      );

      expect(result.sections.find((s) => s.id === 1)?.documents).toEqual([{ id: 20 }]);
      expect(result.sections.map((s) => s.id)).toEqual([1, 2]);
    });

    it('deleteSectionDocumentFailure should store the error without touching loading', () => {
      const state: ISectionState = { ...initialState, loading: false };
      const result = sectionReducer(
        state,
        SectionActions.deleteSectionDocumentFailure({ error: 'Doc delete failed' }),
      );

      expect(result.error).toBe('Doc delete failed');
      expect(result.loading).toBe(false);
    });
  });

  describe('setSectionImportant', () => {
    it('setSectionImportantSuccess should update the section and re-sort (important moves to top)', () => {
      const sections = [
        makeSection({ id: 1, important: false, createdAt: new Date('2024-01-01').toISOString() }),
        makeSection({ id: 2, important: false, createdAt: new Date('2024-02-01').toISOString() }),
      ];
      const updated = makeSection({
        id: 1,
        important: true,
        createdAt: new Date('2024-01-01').toISOString(),
      });

      const state: ISectionState = { ...initialState, sections };
      const result = sectionReducer(
        state,
        SectionActions.setSectionImportantSuccess({ section: updated }),
      );

      // id 1 is now important -> should be first even though it's older
      expect(result.sections.map((s) => s.id)).toEqual([1, 2]);
      expect(result.sections[0].important).toBe(true);
    });

    it('setSectionImportantFailure should store the error', () => {
      const state: ISectionState = { ...initialState };
      const result = sectionReducer(
        state,
        SectionActions.setSectionImportantFailure({ error: 'Toggle failed' }),
      );

      expect(result.error).toBe('Toggle failed');
    });
  });

  describe('sortSections behavior (via addSectionSuccess)', () => {
    it('should sort important sections before non-important ones regardless of date', () => {
      const older = makeSection({
        id: 1,
        important: true,
        createdAt: new Date('2020-01-01').toISOString(),
      });
      const newer = makeSection({
        id: 2,
        important: false,
        createdAt: new Date('2024-01-01').toISOString(),
      });

      const state: ISectionState = { ...initialState, sections: [newer] };
      const result = sectionReducer(
        state,
        SectionActions.addSectionSuccess({ section: older }),
      );

      expect(result.sections.map((s) => s.id)).toEqual([1, 2]);
    });

    it('should sort by newest first within the same importance tier', () => {
      const older = makeSection({
        id: 1,
        important: false,
        createdAt: new Date('2020-01-01').toISOString(),
      });
      const newer = makeSection({
        id: 2,
        important: false,
        createdAt: new Date('2024-01-01').toISOString(),
      });

      const state: ISectionState = { ...initialState, sections: [older] };
      const result = sectionReducer(
        state,
        SectionActions.addSectionSuccess({ section: newer }),
      );

      expect(result.sections.map((s) => s.id)).toEqual([2, 1]);
    });
  });
});