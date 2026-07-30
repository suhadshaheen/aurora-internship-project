import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { SectionActions } from './section.actions';
import { SectionsService } from '../services/sections.service';

@Injectable()
export class SectionEffects {
  private actions$ = inject(Actions);
  private sectionsService = inject(SectionsService);

  loadSections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.loadSections),
      mergeMap(() =>
        this.sectionsService.getAll().pipe(
          map((sections) => SectionActions.loadSectionsSuccess({ sections })),
          catchError((error) => of(SectionActions.loadSectionsFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  addSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.addSection),
      mergeMap(({ section }) =>
        this.sectionsService.create(section).pipe(
          map((createdSection) => SectionActions.addSectionSuccess({ section: createdSection })),
          catchError((error) => of(SectionActions.addSectionFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  updateSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.updateSection),
      mergeMap(({ section }) =>
        this.sectionsService.update(section).pipe(
          map((updatedSection) => SectionActions.updateSectionSuccess({ section: updatedSection })),
          catchError((error) => of(SectionActions.updateSectionFailure({ error: error.message }))),
        ),
      ),
    ),
  );

deleteSection$ = createEffect(() =>
  this.actions$.pipe(
    ofType(SectionActions.deleteSection),
    mergeMap(({ sectionId }) =>
      this.sectionsService.delete(sectionId).pipe(
        map(() => SectionActions.deleteSectionSuccess({ sectionId })),
        catchError((error) =>
          of(SectionActions.deleteSectionFailure({ error: error.message }))
        )
      )
    )
  )
);
}
