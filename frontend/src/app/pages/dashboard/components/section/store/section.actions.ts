import { createAction, props } from '@ngrx/store';
import { ISection } from '../../../../../../models/section.interface';

export const SectionActions = {
  loadSections: createAction('[Section] Load Sections'),
  loadSectionsSuccess: createAction(
    '[Section] Load Sections Success',
    props<{ sections: ISection[] }>(),
  ),
  loadSectionsFailure: createAction('[Section] Load Sections Failure', props<{ error: string }>()),

  addSection: createAction(
    '[Section] Add Section',
    props<{
      title: string;
      content: string;
      categoryId: number;
      visibility: boolean;
      images?: File[];
      documents?: File[];
    }>(),
  ),
  addSectionSuccess: createAction('[Section] Add Section Success', props<{ section: ISection }>()),
  addSectionFailure: createAction('[Section] Add Section Failure', props<{ error: string }>()),

  updateSection: createAction(
    '[Section] Update Section',
    props<{
      id: number;
      title: string;
      content: string;
      categoryId: number;
      visibility: boolean;
      documents?: File[];
    }>(),
  ),
  updateSectionSuccess: createAction(
    '[Section] Update Section Success',
    props<{ section: ISection }>(),
  ),
  updateSectionFailure: createAction(
    '[Section] Update Section Failure',
    props<{ error: string }>(),
  ),

  deleteSection: createAction('[Section] Delete Section', props<{ sectionId: number }>()),
  deleteSectionSuccess: createAction(
    '[Section] Delete Section Success',
    props<{ sectionId: number }>(),
  ),
  deleteSectionFailure: createAction(
    '[Section] Delete Section Failure',
    props<{ error: string }>(),
  ),

  deleteSectionDocument: createAction(
    '[Section] Delete Section Document',
    props<{ sectionId: number; documentId: number }>(),
  ),
  deleteSectionDocumentSuccess: createAction(
    '[Section] Delete Section Document Success',
    props<{ section: ISection }>(),
  ),
  deleteSectionDocumentFailure: createAction(
    '[Section] Delete Section Document Failure',
    props<{ error: string }>(),
  ),

  setSectionImportant: createAction(
    '[Section] Set Section Important',
    props<{ id: number; important: boolean }>(),
  ),
  setSectionImportantSuccess: createAction(
    '[Section] Set Section Important Success',
    props<{ section: ISection }>(),
  ),
  setSectionImportantFailure: createAction(
    '[Section] Set Section Important Failure',
    props<{ error: string }>(),
  ),

  selectSection: createAction('[Section] Select Section', props<{ section: ISection }>()),
};
