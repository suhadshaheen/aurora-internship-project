import { ISection } from '../../../../../../models/section.interface';
import { createReducer, on } from '@ngrx/store';
import { SectionActions } from './section.actions';

export interface ISectionState {
  sections: ISection[];
  selectedSection: ISection | null;
  loading: boolean;
  error: string | null;
}

const initialSectionState: ISectionState = {
  sections: [],
  selectedSection: null,
  loading: false,
  error: null,
};

// Important sections float to the top; within each tier, newest first.
function sortSections(sections: ISection[]): ISection[] {
  return [...sections].sort((a, b) => {
    if (a.important !== b.important) {
      return a.important ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export const sectionReducer = createReducer(
  initialSectionState,
  on(SectionActions.loadSections, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SectionActions.loadSectionsSuccess, (state, { sections }) => ({
    ...state,
    loading: false,
    sections,
  })),
  on(SectionActions.loadSectionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(SectionActions.addSection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SectionActions.addSectionSuccess, (state, { section }) => ({
    ...state,
    loading: false,
    sections: sortSections([section, ...state.sections]),
  })),
  on(SectionActions.addSectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(SectionActions.deleteSection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SectionActions.deleteSectionSuccess, (state, { sectionId }) => ({
    ...state,
    loading: false,
    sections: state.sections.filter((s) => s.id !== sectionId),
  })),
  on(SectionActions.deleteSectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(SectionActions.updateSection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SectionActions.updateSectionSuccess, (state, { section }) => ({
    ...state,
    loading: false,
    sections: state.sections.map((s) => (s.id === section.id ? section : s)),
  })),
  on(SectionActions.updateSectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(SectionActions.selectSection, (state, { section }) => ({
    ...state,
    selectedSection: section,
  })),
  on(SectionActions.deleteSectionDocumentSuccess, (state, { section }) => ({
    ...state,
    sections: state.sections.map((s) => (s.id === section.id ? section : s)),
  })),
  on(SectionActions.deleteSectionDocumentFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(SectionActions.setSectionImportantSuccess, (state, { section }) => ({
    ...state,
    sections: sortSections(state.sections.map((s) => (s.id === section.id ? section : s))),
  })),
  on(SectionActions.setSectionImportantFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
