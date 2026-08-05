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
      mergeMap(({ title, content, categoryId, visibility, images, documents }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('categoryId', categoryId.toString());
        formData.append('visibility', visibility.toString());
        images?.forEach((file) => formData.append('images', file));
        documents?.forEach((file) => formData.append('documents', file));

        return this.sectionsService.create(formData).pipe(
          map((createdSection) => SectionActions.addSectionSuccess({ section: createdSection })),
          catchError((error) => of(SectionActions.addSectionFailure({ error: error.message }))),
        );
      }),
    ),
  );

  updateSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.updateSection),
      mergeMap(({ id, title, content, categoryId, visibility, documents }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('categoryId', categoryId.toString());
        formData.append('visibility', visibility.toString());
        documents?.forEach((file) => formData.append('documents', file));

        return this.sectionsService.update(id, formData).pipe(
          map((updatedSection) => SectionActions.updateSectionSuccess({ section: updatedSection })),
          catchError((error) => of(SectionActions.updateSectionFailure({ error: error.message }))),
        );
      }),
    ),
  );
  deleteSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.deleteSection),
      mergeMap(({ sectionId }) =>
        this.sectionsService.delete(sectionId).pipe(
          map(() => SectionActions.deleteSectionSuccess({ sectionId })),
          catchError((error) => of(SectionActions.deleteSectionFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  deleteSectionDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.deleteSectionDocument),
      mergeMap(({ sectionId, documentId }) =>
        this.sectionsService.deleteDocument(sectionId, documentId).pipe(
          map((section) => SectionActions.deleteSectionDocumentSuccess({ section })),
          catchError((error) => of(SectionActions.deleteSectionDocumentFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  setSectionImportant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.setSectionImportant),
      mergeMap(({ id, important }) =>
        this.sectionsService.setImportant(id, important).pipe(
          map((section) => SectionActions.setSectionImportantSuccess({ section })),
          catchError((error) => of(SectionActions.setSectionImportantFailure({ error: error.message }))),
        ),
      ),
    ),
  );
}
