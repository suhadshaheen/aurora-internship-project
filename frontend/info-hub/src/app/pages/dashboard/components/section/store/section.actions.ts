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
  props<{ section: ISection }>(),
),
  addSectionSuccess: createAction('[Section] Add Section Success', props<{ section: ISection }>()),
  addSectionFailure: createAction('[Section] Add Section Failure', props<{ error: string }>()),

  updateSection: createAction('[Section] Update Section', props<{ section: ISection }>()),
  updateSectionSuccess: createAction(
    '[Section] Update Section Success',
    props<{ section: ISection }>(),
  ),
  updateSectionFailure: createAction(
    '[Section] Update Section Failure',
    props<{ error: string }>(),
  ),

  deleteSection: createAction('[Section] Delete Section', props<{ sectionId: string }>()),
  deleteSectionSuccess: createAction(
    '[Section] Delete Section Success',
    props<{ sectionId: string }>(),
  ),
  deleteSectionFailure: createAction(
    '[Section] Delete Section Failure',
    props<{ error: string }>(),
  ),

  selectSection: createAction('[Section] Select Section', props<{ section: ISection }>()),
};
