import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ISectionState } from './section.reducer';

export const selectSectionState = createFeatureSelector<ISectionState>('section');
export const selectAllSections = createSelector(
  selectSectionState,
  (state: ISectionState) => state.sections,
);

export const selectSelectedSection = createSelector(
  selectSectionState,
  (state: ISectionState) => state.selectedSection,
);

export const selectSectionLoading = createSelector(
  selectSectionState,
  (state: ISectionState) => state.loading,
);
export const selectSectionError = createSelector(selectSectionState, (state) => state.error);

export const selectSectionsByCategoryId = (catId: string) =>
  createSelector(selectAllSections, (sections) => sections.filter((s) => s.catId === catId));
export const selectSectionsByUserId = (userId: string | number) =>
  createSelector(selectAllSections, (sections) => sections.filter((s) => s.userId === userId));
