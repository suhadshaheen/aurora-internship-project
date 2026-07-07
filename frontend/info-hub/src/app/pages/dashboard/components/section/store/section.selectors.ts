import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SectionState } from './section.reducer';

export const selectSectionState = createFeatureSelector<SectionState>('section');
export const selectAllSections = createSelector(
  selectSectionState,
  (state: SectionState) => state.sections,
);

export const selectSelectedSection = createSelector(
  selectSectionState,
  (state: SectionState) => state.selectedSection,
);

export const selectSectionLoading = createSelector(
  selectSectionState,
  (state: SectionState) => state.loading,
);
export const selectSectionError = createSelector(selectSectionState, (state) => state.error);

export const selectSectionsByCategoryId = (catId: string) =>
  createSelector(selectAllSections, (sections) => sections.filter((s) => s.catId === catId));
