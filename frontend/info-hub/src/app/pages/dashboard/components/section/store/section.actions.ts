import { createAction, props } from '@ngrx/store';
import { ISection } from '../../../../../../models/section.interface';

export const loadSections = createAction('[Section] Load Sections');
export const loadSectionsSuccess = createAction(
  '[Section] Load Sections Success',
  props<{ sections: ISection[] }>(),
);
export const loadSectionsFailure = createAction(
  '[Section] Load Sections Failure',
  props<{ error: string }>(),
);

export const addSection = createAction(
  '[Section] Add Section',
  props<{ section: Omit<ISection, 'sectionId' | 'dateCreated'> }>(),
);
export const addSectionSuccess = createAction(
  '[Section] Add Section Success',
  props<{ section: ISection }>(),
);
export const addSectionFailure = createAction(
  '[Section] Add Section Failure',
  props<{ error: string }>(),
);
export const updateSection = createAction(
  '[Section] Update Section',
  props<{ section: ISection }>(),
);
export const updateSectionSuccess = createAction(
  '[Section] Update Section Success',
  props<{ section: ISection }>(),
);
export const updateSectionFailure = createAction(
  '[Section] Update Section Failure',
  props<{ error: string }>(),
);

// Delete
export const deleteSection = createAction(
  '[Section] Delete Section',
  props<{ sectionId: string }>(),
);
export const deleteSectionSuccess = createAction(
  '[Section] Delete Section Success',
  props<{ sectionId: string }>(),
);
export const deleteSectionFailure = createAction(
  '[Section] Delete Section Failure',
  props<{ error: string }>(),
);

// Select
export const selectSection = createAction(
  '[Section] Select Section',
  props<{ section: ISection }>(),
);
